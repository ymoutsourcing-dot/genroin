// === 元老院 PC Agent (Phase 1) ===
// GAS のコマンドキューを poll し、type ベースのホワイトリストで実行・結果返却する
// 二重防衛：GAS 側 ALLOWED_COMMANDS + agent 側 HANDLERS の両方に登録された type のみ実行

require('dotenv').config()
const { exec } = require('child_process')
const { promisify } = require('util')
const path = require('path')
const fs = require('fs')
const execP = promisify(exec)

// === 多重起動防止：ロックファイル ===
const LOCK_FILE = path.join(__dirname, '.agent.lock')
function acquireLock() {
  if (fs.existsSync(LOCK_FILE)) {
    const oldPid = parseInt(fs.readFileSync(LOCK_FILE, 'utf8'), 10) || 0
    if (oldPid > 0) {
      try {
        process.kill(oldPid, 0) // 存在確認のみ
        console.error('[agent] FATAL: 既に他の agent が起動中 (pid ' + oldPid + ')')
        console.error('[agent] kill: powershell Stop-Process -Id ' + oldPid + ' -Force')
        process.exit(1)
      } catch (_) {
        console.log('[agent] 古い lock を継承 (旧 pid ' + oldPid + ' は死亡済)')
      }
    }
  }
  fs.writeFileSync(LOCK_FILE, String(process.pid))
}
function releaseLock() {
  try { fs.unlinkSync(LOCK_FILE) } catch (_) {}
}
acquireLock()
process.on('exit', releaseLock)
process.on('SIGINT', () => { releaseLock(); process.exit(0) })
process.on('SIGTERM', () => { releaseLock(); process.exit(0) })

const GAS_URL = process.env.GAS_URL
const SECRET = process.env.SECRET
const POLL_MS = Number(process.env.POLL_MS) || 5000

if (!GAS_URL || !SECRET) {
  console.error('[agent] FATAL: GAS_URL / SECRET が .env に未設定')
  process.exit(1)
}
if (typeof fetch !== 'function') {
  console.error('[agent] FATAL: Node 18+ 必須（global fetch を使用）')
  process.exit(1)
}

// agentControl で stop 指令を受けたら、結果書き戻し後に exit するためのフラグ
let shouldExit = false

// === 実行ハンドラ（type ベース、ALLOWED_COMMANDS と整合）===
const HANDLERS = {
  ping: async () => ({ exit: 0, log: 'pong' }),

  agentControl: async (payload) => {
    if (payload.action === 'stop') {
      shouldExit = true
      return { exit: 0, log: 'stop signal acknowledged, exiting after this tick' }
    }
    throw new Error('agentControl: unknown action: ' + payload.action)
  },

  openApp: async (payload) => {
    // Windows: 全部 `start ""` 経由（cmd の start が常に exit 0 を返す → quirk 回避）
    const map = {
      chrome:   'start "" chrome',
      vscode:   'start "" code',
      explorer: 'start "" explorer',
      finder:   'start "" explorer', // Windows では finder→explorer に alias
    }
    const cmd = map[payload.name]
    if (!cmd) throw new Error('openApp: unknown name: ' + payload.name)
    await execP(cmd, { timeout: 10000, shell: true })
    return { exit: 0, log: 'opened ' + payload.name }
  },

  buildApp: async (payload) => {
    const map = { genroin: 'F:/FGoogleDrive/元老院/コード/genroin' }
    const dir = map[payload.project]
    if (!dir) throw new Error('buildApp: unknown project: ' + payload.project)
    const { stdout, stderr } = await execP('npm run build', {
      cwd: dir,
      timeout: 180000,
      shell: true,
      maxBuffer: 10 * 1024 * 1024,
    })
    const log = (stderr || stdout || '').replace(/\s+/g, ' ').slice(-200)
    return { exit: 0, log }
  },

  sync: async () => ({ exit: 0, log: 'sync (placeholder)' }),
}

// === GAS 呼び出し（CORS 回避と同じく text/plain）===
async function callGAS(action, body) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(Object.assign({ secret: SECRET, action: action }, body || {})),
  })
  const text = await res.text()
  try { return JSON.parse(text) }
  catch (_) { return { error: 'non-json response: ' + text.slice(0, 200) } }
}

function fmtResult(type, exit, log) {
  return '[type] ' + type + '\n[exit] ' + exit + '\n[log] ' + (log || '')
}

async function executeOne(cmd) {
  const handler = HANDLERS[cmd.type]
  if (!handler) {
    return { status: 'error', result: fmtResult(cmd.type, 1, 'agent: type not allowed: ' + cmd.type) }
  }
  try {
    const r = await handler(cmd.payload || {})
    return { status: 'done', result: fmtResult(cmd.type, r.exit || 0, r.log || '') }
  } catch (err) {
    const msg = String((err && err.message) || err).replace(/\s+/g, ' ').slice(-200)
    return { status: 'error', result: fmtResult(cmd.type, 1, msg) }
  }
}

let busy = false
async function tick() {
  if (busy) return
  busy = true
  try {
    const r = await callGAS('getCommands', { max: 10 })
    if (!r || !r.ok) {
      if (r && r.error) console.error('[agent] getCommands error:', r.error)
      return
    }
    const cmds = r.commands || []
    if (cmds.length === 0) return
    console.log('[agent] received', cmds.length, 'command(s)')
    for (const cmd of cmds) {
      console.log('[agent] →', cmd.id, 'type=' + cmd.type)
      const out = await executeOne(cmd)
      const ack = await callGAS('updateCommand', { id: cmd.id, status: out.status, result: out.result })
      if (ack && ack.ok) {
        console.log('[agent] ✓', cmd.id, '→', out.status)
      } else {
        console.error('[agent] ✗ updateCommand failed:', ack && ack.error)
      }
    }
  } catch (err) {
    console.error('[agent] tick exception:', (err && err.message) || err)
  } finally {
    busy = false
  }
  if (shouldExit) {
    console.log('[agent] received stop signal — bye')
    process.exit(0)
  }
}

console.log('[agent] starting — poll every', POLL_MS, 'ms')
console.log('[agent] GAS_URL:', GAS_URL.slice(0, 60) + '...')
console.log('[agent] handlers:', Object.keys(HANDLERS).join(', '))
setInterval(tick, POLL_MS)
tick()
