// === 元老院システム GAS バックエンド (Phase 1) ===
// - 既存 consensus エンドポイント互換維持
// - 喫煙所 / 元老院 / 案件 / 実行ログ の4シート CRUD
// - secret 必須、ID は GAS 側採番、シート/ヘッダー自動作成

const SECRET = 'vXrkAMH0xcSbnnWwgo5sO4EFGZdLHVzdetYoXVcG'

// === コマンド・ホワイトリスト（PC実行の安全弁） ===
// 各 type ごとに、必須キーと（あれば）値の固定 enum を定義
const ALLOWED_COMMANDS = {
  ping:         { required: [],          enums: {} },
  openApp:      { required: ['name'],    enums: { name: ['chrome', 'vscode', 'finder', 'explorer'] } },
  sync:         { required: [],          enums: {} },
  buildApp:     { required: ['project'], enums: { project: ['genroin'] } },
  agentControl: { required: ['action'],  enums: { action: ['stop'] } },
}
// payload に含まれてはいけないパターン（コマンドインジェクション・パストラバーサル防止）
const FORBIDDEN_PAYLOAD_PATTERNS = [/\.\./, /[~|;&><`]/, /\$\(/, /\$\{/]
const MAX_BATCH = 20

const MODELS = {
  openai: 'gpt-4o-mini',
  claude: 'claude-haiku-4-5-20251001',
}

const SHEET = {
  smoking: '喫煙所',
  genroin: '元老院',
  task: '案件',
  log: '実行ログ',
  command: 'コマンド',
}

const HEADERS = {
  '喫煙所': ['喫煙所ID', '日時', '内容', 'タグ', '投稿者', '処理ステータス'],
  '元老院': ['元老院ID', '元ネタID', 'タイトル', '要約', 'カテゴリ', '優先度', '採用可否', 'メモ', 'AI審議コメント'],
  '案件': ['案件ID', 'タイトル', '元老院ID', 'カテゴリ', '優先度', '担当者', 'ステータス', '期限', '指示書', '実行タイプ'],
  '実行ログ': ['案件ID', '実行日', '結果', '成功/失敗', '学び'],
  'コマンド': ['コマンドID', '日時', 'type', 'payload', '送信者', 'ステータス', '結果'],
}

const SYSTEM_PROMPT_CONSENSUS =
  'あなたは事業責任者の意思決定補助AIです。\n\n' +
  '以下のルールを厳守してください：\n\n' +
  '・必ずOKかNGを出す（保留は禁止）\n' +
  '・不確定要素があっても仮説で判断する\n' +
  '・結論は実行前提で書く\n\n' +
  'フォーマット：\n' +
  '【判断】OK または NG\n' +
  '【結論】具体的な実行方針\n' +
  '【理由】ビジネス的根拠（簡潔）'

const ALLOWED_CATEGORIES = ['戦略', '集客', 'オペ', '財務', 'システム', '法務/リスク']

const CATEGORY_KEYWORDS = {
  '戦略': ['戦略', '方針', 'ビジョン', '中長期', 'ロードマップ', '事業計画', '撤退', '参入', '差別化'],
  '集客': ['集客', 'マーケ', '広告', 'seo', 'sns', 'ブランド', '顧客獲得', 'リード', 'cv', 'ctr', 'cpm', '販促', 'プロモ', 'lp', 'コンバージョン'],
  'オペ': ['オペレーション', 'オペ', '業務', '運用', 'プロセス', '効率', '工数', '体制', 'マニュアル', '手順', 'ワークフロー', '人員'],
  '財務': ['財務', '資金', 'コスト', '売上', '経費', '予算', '投資', '利益', 'roi', 'pl', 'bs', 'キャッシュ', '請求', '支払', '原価'],
  'システム': ['システム', 'インフラ', 'ツール', '開発', 'プログラム', 'api', 'サーバ', 'クラウド', '自動化', 'コード', 'アプリ', 'db', 'デプロイ', 'バグ', 'リファクタ'],
  '法務/リスク': ['法務', '契約', 'コンプライアンス', 'リスク', 'セキュリティ', '個人情報', '規約', '法律', 'リーガル', '訴訟', '違反', '監査'],
}

const SYSTEM_PROMPT_PROCESS =
  'あなたは事業会議の議事整理AIです。\n' +
  '入力されたメモを構造化してください。\n\n' +
  'カテゴリは以下の6つから必ず1つを選択（それ以外は絶対禁止、英語禁止、独自ラベル禁止）：\n' +
  '戦略 / 集客 / オペ / 財務 / システム / 法務/リスク\n\n' +
  '優先度は A（緊急重要） / B（重要） / C（参考） から1つを選択。\n\n' +
  '出力フォーマットを厳守し、余計な前置き・後書き・装飾記号は禁止：\n\n' +
  '【要約】\n1〜2文で簡潔に\n\n' +
  '【カテゴリ】\n上記6つから完全一致の1つ\n\n' +
  '【優先度】\nA または B または C\n\n' +
  '【タイトル】\n15〜40文字の見出し（最大40文字厳守、簡潔に要点を入れる）'

// === ユーティリティ ===

function getKey(name) {
  return PropertiesService.getScriptProperties().getProperty(name)
}

function getSpreadsheet() {
  const props = PropertiesService.getScriptProperties()
  let id = props.getProperty('SHEET_ID')
  if (!id) {
    const ss = SpreadsheetApp.create('元老院システム')
    id = ss.getId()
    props.setProperty('SHEET_ID', id)
  }
  return SpreadsheetApp.openById(id)
}

function ensureSheet(name) {
  const ss = getSpreadsheet()
  let sheet = ss.getSheetByName(name)
  if (!sheet) sheet = ss.insertSheet(name)
  const headers = HEADERS[name]
  if (!headers) throw new Error('No header def for ' + name)
  const range = sheet.getRange(1, 1, 1, headers.length)
  const current = range.getValues()[0]
  let matches = current.length === headers.length
  if (matches) {
    for (let i = 0; i < headers.length; i++) {
      if (current[i] !== headers[i]) { matches = false; break }
    }
  }
  if (!matches) {
    range.setValues([headers])
    sheet.setFrozenRows(1)
  }
  // Clean up default 'シート1' / 'Sheet1' if exists and not in our list
  const defaults = ['シート1', 'Sheet1']
  ss.getSheets().forEach(function (s) {
    if (defaults.indexOf(s.getName()) >= 0 && ss.getSheets().length > 1) {
      try { ss.deleteSheet(s) } catch (e) { /* ignore */ }
    }
  })
  return sheet
}

function todayStamp() {
  return Utilities.formatDate(new Date(), 'JST', 'yyyyMMdd')
}

function pad3(n) {
  const s = '00' + n
  return s.substr(s.length - 3)
}

function nextId(prefix, sheet) {
  const today = todayStamp()
  const data = sheet.getDataRange().getValues()
  let max = 0
  const re = new RegExp('^' + prefix + '-(\\d{8})-(\\d{3})$')
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0] || '')
    const m = id.match(re)
    if (m && m[1] === today) {
      const n = parseInt(m[2], 10)
      if (n > max) max = n
    }
  }
  return prefix + '-' + today + '-' + pad3(max + 1)
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}

// === エントリーポイント ===

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents)
    if (body.secret !== SECRET) return jsonResponse({ error: 'unauthorized' })
    const action = body.action || 'consensus'
    switch (action) {
      case 'consensus':       return jsonResponse(actionConsensus(body))
      case 'addSmoking':      return jsonResponse(actionAddSmoking(body))
      case 'processSmoking':  return jsonResponse(actionProcessSmoking(body))
      case 'createTask':           return jsonResponse(actionCreateTask(body))
      case 'updateTask':           return jsonResponse(actionUpdateTask(body))
      case 'addLog':          return jsonResponse(actionAddLog(body))
      case 'updateGenroin':   return jsonResponse(actionUpdateGenroin(body))
      case 'aiSuggest':       return jsonResponse(actionAiSuggest(body))
      case 'aiReview':        return jsonResponse(actionAiReview(body))
      case 'aiReviewWithFeedback': return jsonResponse(actionAiReviewWithFeedback(body))
      case 'backup':          return jsonResponse(actionBackup(body))
      case 'listBackups':     return jsonResponse(actionListBackups(body))
      case 'restore':         return jsonResponse(actionRestore(body))
      case 'enqueueCommand':  return jsonResponse(actionEnqueueCommand(body))
      case 'getCommands':     return jsonResponse(actionGetCommands(body))
      case 'updateCommand':   return jsonResponse(actionUpdateCommand(body))
      case 'getHeartbeat':    return jsonResponse(actionGetHeartbeat(body))
      case 'list':            return jsonResponse(actionList(body))
      default:                return jsonResponse({ error: 'unknown action: ' + action })
    }
  } catch (err) {
    return jsonResponse({ error: String((err && err.message) || err) })
  }
}

// === ACTIONS ===

function actionConsensus(body) {
  const system = body.system
  const user = body.user
  if (!system || !user) throw new Error('missing system or user')
  return callConsensus(system, user)
}

function actionAddSmoking(body) {
  const d = body.data || {}
  const sheet = ensureSheet(SHEET.smoking)
  const id = nextId('S', sheet)
  sheet.appendRow([
    id,
    new Date(),
    String(d.content || ''),
    String(d.tags || ''),
    String(d.author || ''),
    '未処理',
  ])
  return { ok: true, id: id }
}

function actionProcessSmoking(body) {
  const max = Math.min(Number(body.max) || MAX_BATCH, MAX_BATCH)
  const smokingSheet = ensureSheet(SHEET.smoking)
  const genroinSheet = ensureSheet(SHEET.genroin)
  const data = smokingSheet.getDataRange().getValues()
  const targets = []
  for (let i = 1; i < data.length && targets.length < max; i++) {
    if (data[i][5] === '未処理') {
      targets.push({ rowIdx: i + 1, sourceId: data[i][0], content: data[i][2] })
    }
  }
  if (targets.length === 0) return { ok: true, processed: 0, created: [], errors: [] }
  const created = []
  const errors = []
  for (let j = 0; j < targets.length; j++) {
    const t = targets[j]
    try {
      const ai = callAIProcess(String(t.content || ''))
      const newId = nextId('C', genroinSheet)
      genroinSheet.appendRow([
        newId,
        t.sourceId,
        ai.title,
        ai.summary,
        ai.category,
        ai.priority,
        '',
        '',
      ])
      smokingSheet.getRange(t.rowIdx, 6).setValue('処理済')
      created.push({ smokingId: t.sourceId, genroinId: newId, title: ai.title })
    } catch (err) {
      errors.push({ smokingId: t.sourceId, error: String((err && err.message) || err) })
    }
  }
  return { ok: true, processed: created.length, created: created, errors: errors }
}

function actionUpdateGenroin(body) {
  const id = body.genroinId
  if (!id) throw new Error('genroinId required')
  const sheet = ensureSheet(SHEET.genroin)
  const data = sheet.getDataRange().getValues()
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      if (body.adoption !== undefined) sheet.getRange(i + 1, 7).setValue(body.adoption) // Yes/No
      if (body.memo !== undefined) sheet.getRange(i + 1, 8).setValue(String(body.memo))
      return { ok: true }
    }
  }
  throw new Error('genroin not found: ' + id)
}

function actionCreateTask(body) {
  const id = body.genroinId
  if (!id) throw new Error('genroinId required')
  const genroinSheet = ensureSheet(SHEET.genroin)
  const data = genroinSheet.getDataRange().getValues()
  let row = null
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) { row = data[i]; break }
  }
  if (!row) throw new Error('genroin not found: ' + id)
  if (row[6] !== 'Yes') throw new Error('genroin not approved (採用可否=Yes 必須)')

  // duplicate チェック：同一元老院ID かつ ステータスが未着手/進行中の案件があれば拒否
  const taskSheet = ensureSheet(SHEET.task)
  const taskData = taskSheet.getDataRange().getValues()
  for (let i = 1; i < taskData.length; i++) {
    const t = taskData[i]
    if (t[2] === id) {
      const status = String(t[6] || '')
      if (status === '未着手' || status === '進行中') {
        return {
          ok: false,
          duplicate: true,
          existingTaskId: t[0],
          existingStatus: status,
          error: '既に進行中の案件があります',
        }
      }
      // 完了 / 中止 は再作成OK（continue）
    }
  }

  const newId = nextId('T', taskSheet)
  const instructions = String(body.instructions || '')
  taskSheet.appendRow([
    newId,
    String(row[2] || String(row[3] || '').slice(0, 30)),
    id,
    String(row[4] || ''),
    String(row[5] || ''),
    String(body.assignee || ''),
    '未着手',
    body.deadline ? String(body.deadline) : '',
    instructions,
  ])
  return { ok: true, taskId: newId, hasInstructions: instructions.length > 0 }
}

// 案件汎用更新（指示書／ステータス／担当者／期限／タイトル）
function actionUpdateTask(body) {
  const id = body && body.id
  if (!id) throw new Error('id required (案件ID)')
  const sheet = ensureSheet(SHEET.task)
  const headers = HEADERS[SHEET.task] // [案件ID, タイトル, 元老院ID, カテゴリ, 優先度, 担当者, ステータス, 期限, 指示書]
  const data = sheet.getDataRange().getValues()
  // 更新可能な field → 列名マッピング（id/元老院ID/カテゴリ/優先度 は不変）
  const allowed = {
    title: 'タイトル',
    assignee: '担当者',
    status: 'ステータス',
    deadline: '期限',
    instruction: '指示書',
    executionType: '実行タイプ',
  }
  // ステータス値の妥当性
  const VALID_STATUS = ['未着手', '進行中', '完了', '中止']
  if (body.status !== undefined && VALID_STATUS.indexOf(body.status) < 0) {
    throw new Error('invalid status: ' + body.status)
  }
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      const updated = []
      for (const key in allowed) {
        if (body[key] !== undefined) {
          const colName = allowed[key]
          const colIdx = headers.indexOf(colName)
          if (colIdx < 0) continue
          sheet.getRange(i + 1, colIdx + 1).setValue(String(body[key]))
          updated.push(key)
        }
      }
      return { ok: true, taskId: id, updated: updated }
    }
  }
  throw new Error('task not found: ' + id)
}

function actionAddLog(body) {
  const d = body.data || {}
  const sheet = ensureSheet(SHEET.log)
  sheet.appendRow([
    String(d.taskId || ''),
    new Date(),
    String(d.result || ''),
    String(d.success || ''),
    String(d.learning || ''),
  ])
  return { ok: true }
}

function actionList(body) {
  const name = body.sheet
  if (!name || !HEADERS[name]) throw new Error('invalid sheet: ' + name)
  const sheet = ensureSheet(name)
  const data = sheet.getDataRange().getValues()
  const headers = data[0]
  let rows = []
  for (let i = 1; i < data.length; i++) {
    const obj = {}
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = data[i][j]
    rows.push(obj)
  }
  if (name === SHEET.smoking && body.unprocessedOnly) {
    rows = rows.filter(function (r) { return r['処理ステータス'] === '未処理' })
  }
  // 元老院のステータスフィルタ
  if (name === SHEET.genroin && body.filter) {
    const f = body.filter
    if (f === 'open') {
      rows = rows.filter(function (r) { return !r['採用可否'] })
    } else if (f === 'adopted') {
      rows = rows.filter(function (r) { return r['採用可否'] === 'Yes' })
    } else if (f === 'rejected') {
      rows = rows.filter(function (r) { return r['採用可否'] === 'No' })
    }
    // 'all' or その他 → そのまま
  }
  rows.sort(function (a, b) {
    const aId = String(a[headers[0]] || '')
    const bId = String(b[headers[0]] || '')
    return bId.localeCompare(aId)
  })
  return { ok: true, items: rows }
}

// === PC実行：コマンドキュー ===

function validatePayload(payload) {
  if (payload === null || payload === undefined) return
  const json = JSON.stringify(payload)
  for (let i = 0; i < FORBIDDEN_PAYLOAD_PATTERNS.length; i++) {
    if (FORBIDDEN_PAYLOAD_PATTERNS[i].test(json)) {
      throw new Error('payload に禁止文字列が含まれます: ' + FORBIDDEN_PAYLOAD_PATTERNS[i].source)
    }
  }
}

function actionEnqueueCommand(body) {
  const type = body.type
  const payload = body.payload || {}
  const sender = String(body.sender || 'web')
  if (!type || typeof type !== 'string') throw new Error('type required (string)')
  const spec = ALLOWED_COMMANDS[type]
  if (!spec) throw new Error('type not allowed: ' + type)
  // 必須パラメータチェック
  for (let i = 0; i < spec.required.length; i++) {
    const k = spec.required[i]
    if (payload[k] === undefined || payload[k] === null || payload[k] === '') {
      throw new Error('payload.' + k + ' is required for type=' + type)
    }
  }
  // enum チェック（指定キーは固定値以外 reject）
  const enums = spec.enums || {}
  for (const k in enums) {
    if (payload[k] !== undefined && enums[k].indexOf(payload[k]) < 0) {
      throw new Error('payload.' + k + ' must be one of: ' + enums[k].join(' / '))
    }
  }
  // 危険文字列チェック
  validatePayload(payload)

  const sheet = ensureSheet(SHEET.command)
  const id = nextId('CMD', sheet)
  // ping は agent 不要、即 done として記録
  const isPing = type === 'ping'
  sheet.appendRow([
    id,
    new Date(),
    type,
    JSON.stringify(payload),
    sender,
    isPing ? 'done' : 'queued',
    isPing ? 'pong (' + new Date().toISOString() + ')' : '',
  ])
  return { ok: true, commandId: id, status: isPing ? 'done' : 'queued' }
}

// === PC実行：コマンド取得（agent → poll）===
// queued 状態のコマンドを最大 max 件返す（古い順）
// 副作用：呼び出された瞬間を AGENT_HEARTBEAT に記録（バッジ用）
function actionGetCommands(body) {
  // ピギーバック heartbeat：agent が poll した = 生きてる
  PropertiesService.getScriptProperties().setProperty('AGENT_HEARTBEAT', String(Date.now()))

  const max = Math.min(Number(body && body.max) || 10, 50)
  const sheet = ensureSheet(SHEET.command)
  const data = sheet.getDataRange().getValues()
  // [コマンドID, 日時, type, payload, 送信者, ステータス, 結果]
  const items = []
  for (let i = 1; i < data.length && items.length < max; i++) {
    if (String(data[i][5] || '') !== 'queued') continue
    let payload = {}
    try { payload = JSON.parse(String(data[i][3] || '{}')) } catch (e) { payload = {} }
    items.push({
      id: data[i][0],
      createdAt: data[i][1] instanceof Date ? data[i][1].toISOString() : String(data[i][1] || ''),
      type: String(data[i][2] || ''),
      payload: payload,
      sender: String(data[i][4] || ''),
    })
  }
  return { ok: true, commands: items, count: items.length }
}

// === PC実行：agent 生死確認（UI バッジ用）===
function actionGetHeartbeat() {
  const ts = PropertiesService.getScriptProperties().getProperty('AGENT_HEARTBEAT')
  const last = ts ? Number(ts) : 0
  const now = Date.now()
  const ageMs = last > 0 ? (now - last) : -1
  return { ok: true, lastMs: last, ageMs: ageMs, serverNow: now }
}

// === PC実行：結果書き戻し（agent → 完了通知）===
function actionUpdateCommand(body) {
  const id = body && body.id
  if (!id) throw new Error('id required (コマンドID)')
  const status = String((body && body.status) || '')
  const VALID_STATUS = ['done', 'error', 'running']
  if (VALID_STATUS.indexOf(status) < 0) {
    throw new Error('invalid status: ' + status + ' (allowed: done|error|running)')
  }
  const result = String((body && body.result) || '')
  const sheet = ensureSheet(SHEET.command)
  const data = sheet.getDataRange().getValues()
  // [0]ID [1]日時 [2]type [3]payload [4]送信者 [5]ステータス [6]結果
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 6).setValue(status)
      sheet.getRange(i + 1, 7).setValue(result)
      return { ok: true, commandId: id, status: status }
    }
  }
  throw new Error('command not found: ' + id)
}

// === バックアップ／復元 ===

const BACKUP_FOLDER_NAME = '元老院バックアップ'

function ensureBackupFolder() {
  const it = DriveApp.getFoldersByName(BACKUP_FOLDER_NAME)
  if (it.hasNext()) return it.next()
  return DriveApp.createFolder(BACKUP_FOLDER_NAME)
}

function dumpSheet(name) {
  const sheet = ensureSheet(name)
  const data = sheet.getDataRange().getValues()
  if (data.length < 2) return []
  const headers = data[0]
  const rows = []
  for (let i = 1; i < data.length; i++) {
    const obj = {}
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = data[i][j]
    rows.push(obj)
  }
  return rows
}

function actionBackup(body) {
  const folder = ensureBackupFolder()
  const data = {
    timestamp: new Date().toISOString(),
    note: (body && body.note) || '',
    sheets: {
      '喫煙所': dumpSheet(SHEET.smoking),
      '元老院': dumpSheet(SHEET.genroin),
      '案件': dumpSheet(SHEET.task),
      '実行ログ': dumpSheet(SHEET.log),
    },
  }
  const stamp = Utilities.formatDate(new Date(), 'JST', 'yyyyMMdd_HHmmss')
  const name = 'genroin_backup_' + stamp + '.json'
  const file = folder.createFile(name, JSON.stringify(data, null, 2), 'application/json')
  return {
    ok: true,
    fileId: file.getId(),
    name: name,
    counts: {
      smoking: data.sheets['喫煙所'].length,
      genroin: data.sheets['元老院'].length,
      task: data.sheets['案件'].length,
      log: data.sheets['実行ログ'].length,
    },
  }
}

function actionListBackups() {
  const folder = ensureBackupFolder()
  const filesIt = folder.getFiles()
  const list = []
  while (filesIt.hasNext()) {
    const f = filesIt.next()
    list.push({
      id: f.getId(),
      name: f.getName(),
      date: f.getDateCreated().toISOString(),
      size: f.getSize(),
    })
  }
  list.sort(function (a, b) { return b.date.localeCompare(a.date) })
  return { ok: true, files: list }
}

function actionRestore(body) {
  const fileId = body && body.fileId
  if (!fileId) throw new Error('fileId required')
  const file = DriveApp.getFileById(fileId)
  const content = file.getBlob().getDataAsString()
  const data = JSON.parse(content)
  // backwards-compat: data either { sheets: {...} } or flat { genroin, tasks, smoking, log }
  const src = data.sheets || {
    '喫煙所': data.smoking || [],
    '元老院': data.genroin || [],
    '案件': data.tasks || [],
    '実行ログ': data.log || [],
  }
  const result = {}
  const sheetNames = ['喫煙所', '元老院', '案件', '実行ログ']
  for (let i = 0; i < sheetNames.length; i++) {
    const name = sheetNames[i]
    const sheet = ensureSheet(name)
    const headers = HEADERS[name]
    const rows = src[name] || []
    // ヘッダ行（行1）保持、データ行をクリア
    const lastRow = sheet.getLastRow()
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent()
    }
    if (rows.length > 0) {
      const matrix = rows.map(function (r) {
        return headers.map(function (h) {
          return r[h] !== undefined && r[h] !== null ? r[h] : ''
        })
      })
      sheet.getRange(2, 1, matrix.length, headers.length).setValues(matrix)
    }
    result[name] = rows.length
  }
  return { ok: true, restored: result, sourceName: file.getName() }
}

// === AI: 個別議題の審議コメント生成 ===

function runAiReviewCore(id, feedback) {
  if (!id) throw new Error('genroinId required')
  const apiKey = getKey('OPENAI_API_KEY')
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  const sheet = ensureSheet(SHEET.genroin)
  const data = sheet.getDataRange().getValues()
  let row = null
  let rowIdx = -1
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) { row = data[i]; rowIdx = i + 1; break }
  }
  if (!row) throw new Error('genroin not found: ' + id)

  const title = String(row[2] || '')
  const summary = String(row[3] || '')
  const category = String(row[4] || '')
  const priority = String(row[5] || '')
  const fb = String(feedback || '').trim()

  const system =
    'あなたは事業判断の補佐官です。' +
    '以下の議題について、採用すべきか検討してください。' +
    (fb ? 'ユーザーコメント（陛下のご意見）が添えられている場合は、必ずそれを優先的に踏まえて論点を更新してください。' : '') +
    '必ず以下フォーマットで出力（前置き・後書き禁止）：\n\n' +
    '【AI見解】\n' +
    '■ 採用理由：\n（なぜやるべきか・1〜2文）\n\n' +
    '■ 懸念点：\n（リスク・不足・曖昧さ・1〜2文）\n\n' +
    '■ 推奨アクション：\n（次にやるべき具体行動・1〜2文）'

  let user =
    '議題：\n' + title + '\n' + summary +
    '\n\nカテゴリ：' + category + '\n優先度：' + priority
  if (fb) {
    user += '\n\n【ユーザーコメント】\n' + fb
  }

  const res = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + apiKey },
    payload: JSON.stringify({
      model: MODELS.openai,
      temperature: 0.4,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (res.getResponseCode() !== 200) {
    throw new Error('OpenAI HTTP ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200))
  }
  const json = JSON.parse(res.getContentText())
  const text = (json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || ''
  const review = text.trim()

  // 元老院シート 9列目（AI審議コメント）に保存（既存上書き）
  sheet.getRange(rowIdx, 9).setValue(review)

  return { ok: true, genroinId: id, review: review, withFeedback: !!fb }
}

function actionAiReview(body) {
  return runAiReviewCore(body && body.genroinId, null)
}

function actionAiReviewWithFeedback(body) {
  return runAiReviewCore(body && body.genroinId, body && body.feedback)
}

// === AI: 状況進言（GPT文脈分析）===

function actionAiSuggest(body) {
  const apiKey = getKey('OPENAI_API_KEY')
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  // データを slim 化してトークン節約（最大30件・必要フィールドのみ）
  const slimGenroin = (body.genroin || []).slice(0, 30).map(function (g) {
    return {
      id: g['元老院ID'] || g.id,
      title: g['タイトル'] || g.title,
      summary: String(g['要約'] || g.summary || '').slice(0, 80),
      category: g['カテゴリ'] || g.category,
      priority: g['優先度'] || g.priority,
      adoption: g['採用可否'] || g.adoption || '未決',
    }
  })
  const slimTasks = (body.tasks || []).slice(0, 30).map(function (t) {
    return {
      id: t['案件ID'] || t.id,
      title: t['タイトル'] || t.title,
      status: t['ステータス'] || t.status || '未着手',
      priority: t['優先度'] || t.priority,
      assignee: t['担当者'] || t.assignee || '',
      deadline: t['期限'] || t.deadline || '',
    }
  })
  const slimSmoking = (body.smoking || []).slice(0, 30).map(function (s) {
    return {
      id: s['喫煙所ID'] || s.id,
      content: String(s['内容'] || s.content || '').slice(0, 80),
    }
  })

  const system =
    'あなたは事業オペレーションを束ねる戦略補佐官です。' +
    '渡される議題（genroin）・勅命（tasks）・未処理上奏（smoking）の現状を読み取り、' +
    '今この瞬間に最も優先度の高い行動を簡潔に2〜3文で提案してください。' +
    '具体的なIDやタイトルを引用しつつ、何を、なぜ、その後どう繋ぐかを述べる。' +
    '前置き・後書き・装飾記号禁止。雅な口調可。200文字以内厳守。'

  const userPayload = JSON.stringify({
    genroin: slimGenroin,
    tasks: slimTasks,
    smoking: slimSmoking,
  })

  const res = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + apiKey },
    payload: JSON.stringify({
      model: MODELS.openai,
      temperature: 0.4,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPayload },
      ],
    }),
  })
  if (res.getResponseCode() !== 200) {
    throw new Error('OpenAI HTTP ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200))
  }
  const json = JSON.parse(res.getContentText())
  const text = (json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || ''
  return { ok: true, suggestion: text.trim() }
}

// === AI: 喫煙所 → 元老院 構造化処理 ===

function callAIProcess(content) {
  const apiKey = getKey('OPENAI_API_KEY')
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')
  const res = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + apiKey },
    payload: JSON.stringify({
      model: MODELS.openai,
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_PROCESS },
        { role: 'user', content: content },
      ],
    }),
  })
  if (res.getResponseCode() !== 200) {
    throw new Error('OpenAI HTTP ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200))
  }
  const json = JSON.parse(res.getContentText())
  const text = (json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || ''
  return parseProcessResponse(text)
}

function normalizeCategory(raw, summary) {
  const r = String(raw || '').trim()
  // 1. 完全一致
  if (ALLOWED_CATEGORIES.indexOf(r) >= 0) return r
  // 2. 部分一致（"戦略系" → "戦略" 等）
  for (let i = 0; i < ALLOWED_CATEGORIES.length; i++) {
    const a = ALLOWED_CATEGORIES[i]
    if (r.indexOf(a) >= 0) return a
  }
  // 3. キーワード推定（要約も対象）
  const text = (r + ' ' + String(summary || '')).toLowerCase()
  for (let i = 0; i < ALLOWED_CATEGORIES.length; i++) {
    const cat = ALLOWED_CATEGORIES[i]
    const kws = CATEGORY_KEYWORDS[cat] || []
    for (let j = 0; j < kws.length; j++) {
      if (text.indexOf(String(kws[j]).toLowerCase()) >= 0) return cat
    }
  }
  // 4. 既定値
  return '戦略'
}

function truncateTitle(t, max) {
  const s = String(t || '')
  if (s.length <= max) return s
  return s.slice(0, max)
}

function parseProcessResponse(text) {
  function pick(label) {
    const re = new RegExp('【' + label + '】\\s*([\\s\\S]*?)(?=\\n*【(?:要約|カテゴリ|優先度|タイトル)】|$)')
    const m = text.match(re)
    return m ? m[1].trim() : ''
  }
  const summary = pick('要約')
  const categoryRaw = pick('カテゴリ')
  const category = normalizeCategory(categoryRaw, summary)
  const priorityRaw = pick('優先度').toUpperCase()
  const pm = priorityRaw.match(/A|B|C/)
  const priority = pm ? pm[0] : 'C'
  const titleRaw = pick('タイトル') || summary
  const title = truncateTitle(titleRaw, 40)
  return { summary: summary, category: category, priority: priority, title: title }
}

// === コンセンサス（既存・互換維持） ===

function callConsensus(system, user) {
  const requests = [
    buildOpenAIRequest(system, user),
    buildClaudeRequest(system, user),
  ]
  const responses = UrlFetchApp.fetchAll(requests)
  const votes = [
    parseProvider('openai', MODELS.openai, responses[0], extractOpenAIText),
    parseProvider('claude', MODELS.claude, responses[1], extractClaudeText),
  ]
  const success = votes.filter(function (v) { return v.ok })
  if (success.length === 0) {
    throw new Error('全AI失敗: ' + votes.map(function (v) { return v.error }).join(' / '))
  }
  const okVotes = success.filter(function (v) { return v.judgment === 'OK' })
  const ngVotes = success.filter(function (v) { return v.judgment === 'NG' })
  let winner
  if (okVotes.length > ngVotes.length) {
    winner = okVotes[0]
  } else if (ngVotes.length > okVotes.length) {
    winner = ngVotes[0]
  } else {
    winner = ngVotes[0] || {
      judgment: 'NG',
      conclusion: 'AI間で意見が分かれたため保守的にNG',
      reason: 'タイブレーク（保守判断）',
    }
  }
  return {
    judgment: winner.judgment,
    conclusion: winner.conclusion,
    reason: winner.reason,
    votes: votes,
  }
}

function buildOpenAIRequest(system, user) {
  return {
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + getKey('OPENAI_API_KEY') },
    payload: JSON.stringify({
      model: MODELS.openai,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  }
}

function buildClaudeRequest(system, user) {
  return {
    url: 'https://api.anthropic.com/v1/messages',
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: {
      'x-api-key': getKey('ANTHROPIC_API_KEY'),
      'anthropic-version': '2023-06-01',
    },
    payload: JSON.stringify({
      model: MODELS.claude,
      max_tokens: 512,
      temperature: 0.3,
      system: system,
      messages: [{ role: 'user', content: user }],
    }),
  }
}

function extractOpenAIText(json) {
  return (json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || ''
}

function extractClaudeText(json) {
  return (json && json.content && json.content[0] && json.content[0].text) || ''
}

function parseProvider(provider, model, response, extractor) {
  try {
    const code = response.getResponseCode()
    if (code < 200 || code >= 300) {
      return {
        model: model,
        ok: false,
        error: provider + ' HTTP ' + code + ': ' + response.getContentText().slice(0, 200),
      }
    }
    const json = JSON.parse(response.getContentText())
    const text = extractor(json)
    if (!text) return { model: model, ok: false, error: provider + ' empty response' }
    const parsed = parseAIResponse(text)
    return { model: model, ok: true, judgment: parsed.judgment, conclusion: parsed.conclusion, reason: parsed.reason }
  } catch (err) {
    return { model: model, ok: false, error: provider + ' parse error: ' + (err.message || err) }
  }
}

function parseAIResponse(text) {
  function pick(label) {
    const re = new RegExp('【' + label + '】\\s*([\\s\\S]*?)(?=\\n*【(?:判断|結論|理由)】|$)')
    const m = text.match(re)
    return m ? m[1].trim() : ''
  }
  const rawJ = pick('判断')
  const m = rawJ.toUpperCase().match(/OK|NG/)
  const judgment = m ? m[0] : 'NG'
  return {
    judgment: judgment,
    conclusion: pick('結論') || text.trim().slice(0, 200),
    reason: pick('理由') || '',
  }
}
