import { useState } from 'react'

const CATEGORIES = ['EC', '買取', '新規事業', '管理']

const INPUT_TEMPLATE =
  '【カテゴリ】\nEC / 買取 / 新規事業 / 管理\n\n【現状】\n\n【課題】\n\n【判断したいこと】\n'

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at top, #14110a 0%, #0a0a0a 60%)',
    color: '#e8e8e8',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif',
    padding: '24px 16px',
    boxSizing: 'border-box',
  },
  container: {
    maxWidth: 880,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: { fontSize: 24, fontWeight: 700, margin: 0, color: '#fbbf24', letterSpacing: 2 },
  subtitle: { fontSize: 12, color: '#9ca3af', margin: 0, letterSpacing: 1 },
  card: {
    background: 'linear-gradient(180deg, #1a1a1a 0%, #141414 100%)',
    border: '1px solid #3a2f15',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,160,23,0.08)',
  },
  fieldRow: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
  label: { fontSize: 11, fontWeight: 700, color: '#d4a017', letterSpacing: 1 },
  catRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  catBtn: (active) => ({
    padding: '8px 14px',
    borderRadius: 999,
    border: '1px solid ' + (active ? '#d4a017' : '#3a2f15'),
    background: active ? '#d4a017' : '#1a1a1a',
    color: active ? '#0a0a0a' : '#e8e8e8',
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
  }),
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #3a2f15',
    fontSize: 14,
    boxSizing: 'border-box',
    background: '#0d0d0d',
    color: '#e8e8e8',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #3a2f15',
    fontSize: 14,
    minHeight: 120,
    resize: 'vertical',
    boxSizing: 'border-box',
    background: '#0d0d0d',
    color: '#e8e8e8',
    fontFamily: 'inherit',
  },
  uploadRow: { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  thumb: {
    width: 80,
    height: 80,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #3a2f15',
  },
  thumbWrap: { position: 'relative' },
  thumbRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: 'none',
    background: '#d4a017',
    color: '#0a0a0a',
    fontSize: 12,
    lineHeight: '20px',
    cursor: 'pointer',
    padding: 0,
  },
  fileBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px dashed #6b5a2a',
    background: '#0d0d0d',
    fontSize: 13,
    cursor: 'pointer',
    color: '#9ca3af',
  },
  runBtn: (disabled) => ({
    padding: '12px 20px',
    borderRadius: 10,
    border: '1px solid ' + (disabled ? '#3a2f15' : '#d4a017'),
    background: disabled
      ? '#1a1a1a'
      : 'linear-gradient(180deg, #fbbf24 0%, #d4a017 100%)',
    color: disabled ? '#6b7280' : '#0a0a0a',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: '100%',
    boxShadow: disabled ? 'none' : '0 2px 8px rgba(212,160,23,0.3)',
  }),
  resultBlock: {
    background: '#0d0d0d',
    border: '1px solid #3a2f15',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    lineHeight: 1.6,
    color: '#e8e8e8',
  },
  resultLabel: { fontSize: 11, color: '#d4a017', fontWeight: 700, marginBottom: 4, letterSpacing: 1 },
  historyItemDyn: (important, active) => ({
    borderTop: '1px solid #2a2418',
    padding: '12px 10px',
    fontSize: 13,
    lineHeight: 1.55,
    background: important ? 'rgba(212,160,23,0.08)' : 'transparent',
    borderLeft: important ? '3px solid #d4a017' : '3px solid transparent',
    opacity: active ? 1 : 0.45,
    color: active ? '#e8e8e8' : '#6b7280',
    borderRadius: 4,
  }),
  badge: {
    display: 'inline-block',
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 999,
    background: '#2a2418',
    color: '#d4a017',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  badgeImportant: {
    background: '#d4a017',
    color: '#0a0a0a',
    marginLeft: 4,
    marginRight: 0,
    fontWeight: 700,
  },
  meta: { color: '#6b7280', fontSize: 11 },
  emptyHistory: { color: '#6b7280', fontSize: 13, padding: '8px 0', fontStyle: 'italic' },
  tmplBtn: {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 6,
    border: '1px solid #3a2f15',
    background: '#0d0d0d',
    color: '#d4a017',
    cursor: 'pointer',
  },
  flagRow: {
    display: 'flex',
    gap: 14,
    marginTop: 6,
    fontSize: 12,
    color: '#9ca3af',
  },
  flagLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    userSelect: 'none',
  },
  quickRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  quickBtnImportant: {
    padding: '6px 12px',
    fontSize: 12,
    borderRadius: 6,
    border: '1px solid #d4a017',
    background: 'linear-gradient(180deg, #fbbf24 0%, #d4a017 100%)',
    color: '#0a0a0a',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 0.5,
  },
  quickBtnDiscard: {
    padding: '6px 12px',
    fontSize: 12,
    borderRadius: 6,
    border: '1px solid #3a2f15',
    background: '#1a1a1a',
    color: '#9ca3af',
    cursor: 'pointer',
  },
  quickBtnHold: {
    padding: '6px 12px',
    fontSize: 12,
    borderRadius: 6,
    border: '1px solid #3a2f15',
    background: 'transparent',
    color: '#9ca3af',
    cursor: 'pointer',
  },
  tabBar: {
    display: 'flex',
    gap: 4,
    borderBottom: '1px solid #3a2f15',
    marginBottom: 4,
    overflowX: 'auto',
  },
  tabBtn: (active) => ({
    padding: '10px 16px',
    border: 'none',
    background: 'transparent',
    color: active ? '#fbbf24' : '#9ca3af',
    fontWeight: active ? 700 : 500,
    fontSize: 14,
    cursor: 'pointer',
    borderBottom: active ? '2px solid #d4a017' : '2px solid transparent',
    marginBottom: -1,
    whiteSpace: 'nowrap',
    letterSpacing: 0.5,
  }),
  smokingItem: {
    borderTop: '1px solid #2a2418',
    padding: '10px 0',
    fontSize: 13,
    lineHeight: 1.55,
  },
  rowActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    alignItems: 'center',
  },
  primaryBtn: (disabled) => ({
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid ' + (disabled ? '#3a2f15' : '#d4a017'),
    background: disabled
      ? '#1a1a1a'
      : 'linear-gradient(180deg, #fbbf24 0%, #d4a017 100%)',
    color: disabled ? '#6b7280' : '#0a0a0a',
    fontSize: 14,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    letterSpacing: 1,
  }),
  secondaryBtn: (disabled) => ({
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid #3a2f15',
    background: '#0d0d0d',
    color: disabled ? '#6b7280' : '#d4a017',
    fontSize: 13,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }),
  placeholder: {
    color: '#6b7280',
    fontSize: 14,
    padding: '40px 0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  toast: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
    color: '#fbbf24',
    padding: '10px 20px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    border: '1px solid #d4a017',
    boxShadow: '0 4px 16px rgba(212,160,23,0.3)',
    zIndex: 9999,
    pointerEvents: 'none',
    letterSpacing: 0.5,
  },
  deliberating: {
    color: '#fbbf24',
    animation: 'genroinPulse 1.4s ease-in-out infinite',
  },
}

function autoTitle(text, category) {
  const trimmed = (text || '').trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''
  const head = trimmed.length > 20 ? trimmed.slice(0, 20) + '…' : trimmed
  return '[' + category + '] ' + head
}

function tokenize(text) {
  if (!text) return []
  const parts = String(text)
    .toLowerCase()
    .split(/[\s,。、！？!?.…「」（）()【】[\]:：/／\\・"'`~@#$%^&*+=|<>{}-]+/)
  const seen = new Set()
  for (const p of parts) {
    if (p && p.length >= 2) seen.add(p)
  }
  return Array.from(seen)
}

function searchRelevantLogs(history, input, category) {
  if (!Array.isArray(history) || history.length === 0) return []
  const tokens = tokenize(input)
  if (tokens.length === 0) return []
  let active = history.filter((h) => h.isActive !== false)
  const important = active.filter((h) => h.isImportant === true)
  if (important.length > 0) active = important
  if (active.length === 0) return []
  const scored = []
  for (const log of active) {
    const title = String(log.title || '').toLowerCase()
    const inp = String(log.input || '').toLowerCase()
    const concl = String(log.conclusion || '').toLowerCase()
    let score = 0
    for (const t of tokens) {
      if (title.includes(t)) score += 3
      if (concl.includes(t)) score += 2
      if (inp.includes(t)) score += 1
    }
    if (category && log.category === category) score += 2
    if (log.isImportant === true) score += 3
    if (score > 0) scored.push({ log, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 3).map((s) => s.log)
}

function buildUserPrompt(category, input, relevant) {
  if (!relevant || relevant.length === 0) {
    return '【カテゴリ】' + category + '\n【入力】\n' + input
  }
  const ctx = relevant
    .map(
      (r) =>
        '・' +
        (r.title || '(無題)') +
        '\n結論：' +
        (r.conclusion || '') +
        '\n理由：' +
        (r.reason || ''),
    )
    .join('\n\n')
  return (
    'モード：' +
    category +
    '\n\n過去の関連判断：\n' +
    ctx +
    '\n\n今回の入力：\n' +
    input
  )
}

const SYSTEM_PROMPT =
  'あなたは事業責任者の意思決定補助AIです。\n\n' +
  '以下のルールを厳守してください：\n\n' +
  '・必ずOKかNGを出す（保留は禁止）\n' +
  '・不確定要素があっても仮説で判断する\n' +
  '・結論は実行前提で書く\n\n' +
  'フォーマット：\n' +
  '【判断】OK または NG\n' +
  '【結論】具体的な実行方針\n' +
  '【理由】ビジネス的根拠（簡潔）'

const GAS_URL =
  'https://script.google.com/macros/s/AKfycbzGMnq2PCB2zXkpz_-a2DNH0svR-TCLJnyTqCD2Bts-YYp2ur0PUv-IQEFFJgz-Brjy/exec'
const GAS_SECRET = 'abc123'

async function callGAS(action, body) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action,
      secret: GAS_SECRET,
      ...(body || {}),
    }),
  })
  if (!res.ok) throw new Error('Network error')
  const data = await res.json()
  if (data?.error) throw new Error(data.error)
  return data
}

function formatTimestamp(v) {
  if (!v) return ''
  try {
    const d = new Date(v)
    if (isNaN(d.getTime())) return String(v)
    const pad = (n) => String(n).padStart(2, '0')
    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      ' ' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes())
    )
  } catch {
    return String(v)
  }
}

function nowStamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    ' ' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes()) +
    ':' +
    pad(d.getSeconds())
  )
}

export default function GenroinConsole() {
  const [category, setCategory] = useState('EC')
  const [title, setTitle] = useState('')
  const [titleEdited, setTitleEdited] = useState(false)
  const [input, setInput] = useState('')
  const [images, setImages] = useState([])
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  // ==== Phase 2: 喫煙所 / 元老院 / 案件 ====
  const [activeTab, setActiveTab] = useState('judge') // 'judge' | 'smoking' | 'genroin' | 'task'
  const [smokingForm, setSmokingForm] = useState({ content: '', tags: '', author: '' })
  const [smokingList, setSmokingList] = useState([])
  const [smokingListLoading, setSmokingListLoading] = useState(false)
  const [smokingPosting, setSmokingPosting] = useState(false)
  const [smokingProcessing, setSmokingProcessing] = useState(false)

  const handleInputChange = (e) => {
    const v = e.target.value
    setInput(v)
    if (!titleEdited) setTitle(autoTitle(v, category))
  }

  const handleCategoryChange = (c) => {
    setCategory(c)
    if (!titleEdited) setTitle(autoTitle(input, c))
  }

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
    setTitleEdited(true)
  }

  const handleInsertTemplate = () => {
    setInput((prev) => {
      const next = prev ? prev + (prev.endsWith('\n') ? '' : '\n') + '\n' + INPUT_TEMPLATE : INPUT_TEMPLATE
      if (!titleEdited) setTitle(autoTitle(next, category))
      return next
    })
  }

  const handleTabChange = (next) => {
    setActiveTab(next)
    setError('')
    if (next === 'smoking' && smokingList.length === 0) loadSmokingList()
  }

  const loadSmokingList = async () => {
    setSmokingListLoading(true)
    setError('')
    try {
      const r = await callGAS('list', { sheet: '喫煙所', unprocessedOnly: true })
      setSmokingList(Array.isArray(r.items) ? r.items : [])
    } catch (e) {
      setError(e?.message || '一覧取得失敗')
    } finally {
      setSmokingListLoading(false)
    }
  }

  const handleSmokingPost = async () => {
    const content = smokingForm.content.trim()
    if (!content || smokingPosting) return
    setSmokingPosting(true)
    setError('')
    try {
      const r = await callGAS('addSmoking', {
        data: {
          content,
          tags: smokingForm.tags.trim(),
          author: smokingForm.author.trim(),
        },
      })
      showToast('奏上完了: ' + r.id)
      setSmokingForm({ content: '', tags: '', author: smokingForm.author })
      await loadSmokingList()
    } catch (e) {
      setError(e?.message || '投稿失敗')
    } finally {
      setSmokingPosting(false)
    }
  }

  const handleSmokingProcess = async () => {
    if (smokingProcessing) return
    setSmokingProcessing(true)
    setError('')
    try {
      const r = await callGAS('processSmoking', { max: 20 })
      const n = r.processed || 0
      const errN = (r.errors || []).length
      if (n === 0 && errN === 0) {
        showToast('未処理なし')
      } else {
        showToast(n + '件を議に付しました（失敗' + errN + '）')
      }
      await loadSmokingList()
    } catch (e) {
      setError(e?.message || 'AI処理失敗')
    } finally {
      setSmokingProcessing(false)
    }
  }

  const toggleFlag = (id, key) => {
    setHistory((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [key]: !h[key] } : h)),
    )
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast((cur) => (cur === msg ? '' : cur)), 1500)
  }

  const applyQuickAction = (id, type) => {
    if (!id) return
    if (type === 'important') {
      setHistory((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, isImportant: true, isActive: true } : h,
        ),
      )
      showToast('★ 勅令として記録')
    } else if (type === 'discard') {
      setHistory((prev) =>
        prev.map((h) => (h.id === id ? { ...h, isActive: false } : h)),
      )
      showToast('却下')
    } else if (type === 'hold') {
      showToast('持ち越し')
    }
  }

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const remaining = 3 - images.length
    const accepted = files.slice(0, remaining)
    accepted.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImages((prev) => (prev.length >= 3 ? prev : [...prev, ev.target.result]))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const saveLog = (entry) => {
    // TODO: GAS endpoint へ POST して Google Sheets に保存
    setHistory((prev) => [entry, ...prev].slice(0, 50))
  }

  const handleRun = async () => {
    if (!input.trim() || loading) return
    const finalTitle = (title || autoTitle(input, category)).trim()
    const snapshotInput = input.trim()
    const snapshotImages = images.length
    setLoading(true)
    setError('')
    try {
      const relevant = searchRelevantLogs(history, snapshotInput, category)
      const userPrompt = buildUserPrompt(category, snapshotInput, relevant)
      const r = await callGAS('consensus', { system: SYSTEM_PROMPT, user: userPrompt })
      const entry = {
        id: nowStamp() + '-' + Math.random().toString(36).slice(2, 8),
        timestamp: nowStamp(),
        category,
        title: finalTitle,
        input: snapshotInput,
        judgment: r.judgment,
        conclusion: r.conclusion,
        reason: r.reason,
        image_count: snapshotImages,
        isImportant: false,
        isActive: true,
        votes: r.votes,
      }
      setResult(entry)
      saveLog(entry)
      setInput('')
      setImages([])
      setTitle('')
      setTitleEdited(false)
    } catch (err) {
      setError(err?.message || 'API呼び出しに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const canRun = input.trim().length > 0 && !loading

  return (
    <div style={styles.page}>
      <style>{`@keyframes genroinPulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>元 老 院</h1>
          <p style={styles.subtitle}>御 前 会 議 — 裁可と記録の一元</p>
        </div>

        <div style={styles.tabBar}>
          {[
            { key: 'judge', label: '即決（AI判断）' },
            { key: 'smoking', label: '上奏（喫煙所）' },
            { key: 'genroin', label: '議事（元老院）' },
            { key: 'task', label: '勅命（案件）' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              style={styles.tabBtn(activeTab === t.key)}
              onClick={() => handleTabChange(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div
            style={{
              ...styles.card,
              borderColor: '#fecaca',
              background: '#fef2f2',
              color: '#b91c1c',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {activeTab === 'judge' && (<>

        <div style={styles.card}>
          <div style={styles.fieldRow}>
            <span style={styles.label}>議題</span>
            <div style={styles.catRow}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  style={styles.catBtn(category === c)}
                  onClick={() => handleCategoryChange(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.fieldRow}>
            <span style={styles.label}>議題名（自動生成・編集可）</span>
            <input
              type="text"
              style={styles.input}
              value={title}
              onChange={handleTitleChange}
              placeholder="上奏内容より自動生成"
            />
          </div>

          <div style={styles.fieldRow}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <span style={styles.label}>上奏内容</span>
              <button
                type="button"
                onClick={handleInsertTemplate}
                style={styles.tmplBtn}
              >
                ＋ 定型奏上
              </button>
            </div>
            <textarea
              style={styles.textarea}
              value={input}
              onChange={handleInputChange}
              placeholder="御諮問の趣旨を述べよ"
            />
          </div>

          <div style={styles.fieldRow}>
            <span style={styles.label}>添付（最大3枚・プレビューのみ）</span>
            <div style={styles.uploadRow}>
              {images.map((src, i) => (
                <div key={i} style={styles.thumbWrap}>
                  <img src={src} alt={'preview-' + i} style={styles.thumb} />
                  <button
                    type="button"
                    style={styles.thumbRemove}
                    onClick={() => removeImage(i)}
                    aria-label="remove"
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <label style={styles.fileBtn}>
                  ＋ 添付追加
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFiles}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>

          <button
            type="button"
            style={styles.runBtn(!canRun)}
            disabled={!canRun}
            onClick={handleRun}
          >
            {loading ? (
              <span style={styles.deliberating}>審議中…</span>
            ) : (
              '裁可（実行）'
            )}
          </button>
        </div>

        {result && (
          <div style={styles.card}>
            <div style={{ ...styles.label, marginBottom: 10 }}>裁可</div>
            <div style={{ marginBottom: 8 }}>
              <span style={styles.badge}>{result.category}</span>
              <strong>{result.title}</strong>
              <span style={{ ...styles.meta, marginLeft: 8 }}>{result.timestamp}</span>
            </div>
            <div style={{ ...styles.resultBlock, marginBottom: 10 }}>
              <div style={styles.resultLabel}>御見立</div>
              {result.judgment}
            </div>
            <div style={{ ...styles.resultBlock, marginBottom: 10 }}>
              <div style={styles.resultLabel}>御沙汰</div>
              {result.conclusion}
            </div>
            <div style={styles.resultBlock}>
              <div style={styles.resultLabel}>仰せの理</div>
              {result.reason}
            </div>
            <div style={styles.quickRow}>
              <button
                type="button"
                style={styles.quickBtnImportant}
                onClick={() => applyQuickAction(result.id, 'important')}
              >
                ★ 勅令認定
              </button>
              <button
                type="button"
                style={styles.quickBtnDiscard}
                onClick={() => applyQuickAction(result.id, 'discard')}
              >
                却下
              </button>
              <button
                type="button"
                style={styles.quickBtnHold}
                onClick={() => applyQuickAction(result.id, 'hold')}
              >
                持ち越し
              </button>
            </div>
          </div>
        )}

        <div style={styles.card}>
          <div style={{ ...styles.label, marginBottom: 6 }}>
            議事録（最新{Math.min(history.length, 50)}件 / 最大50）
          </div>
          {history.length === 0 ? (
            <div style={styles.emptyHistory}>議事録なし</div>
          ) : (
            history.map((h, i) => {
              const isActive = h.isActive !== false
              const isImportant = !!h.isImportant
              return (
                <div
                  key={h.id || i}
                  style={styles.historyItemDyn(isImportant, isActive)}
                >
                  <div style={{ marginBottom: 4 }}>
                    <span style={styles.badge}>{h.category}</span>
                    <strong>{h.title}</strong>
                    {isImportant && (
                      <span style={{ ...styles.badge, ...styles.badgeImportant }}>
                        ★勅令
                      </span>
                    )}
                    <span style={{ ...styles.meta, marginLeft: 8 }}>
                      {h.timestamp}
                    </span>
                    {h.image_count > 0 && (
                      <span style={{ ...styles.meta, marginLeft: 8 }}>
                        添付{h.image_count}枚
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#555' }}>{h.input}</div>
                  <div style={{ color: '#777', marginTop: 2 }}>
                    → {h.conclusion}
                  </div>
                  <div style={styles.flagRow}>
                    <label style={styles.flagLabel}>
                      <input
                        type="checkbox"
                        checked={isImportant}
                        onChange={() => toggleFlag(h.id, 'isImportant')}
                        disabled={!h.id}
                      />
                      勅令
                    </label>
                    <label style={styles.flagLabel}>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => toggleFlag(h.id, 'isActive')}
                        disabled={!h.id}
                      />
                      議題対象
                    </label>
                  </div>
                </div>
              )
            })
          )}
        </div>

        </>)}

        {activeTab === 'smoking' && (
          <>
            <div style={styles.card}>
              <div style={styles.fieldRow}>
                <span style={styles.label}>上奏文</span>
                <textarea
                  style={styles.textarea}
                  value={smokingForm.content}
                  onChange={(e) =>
                    setSmokingForm({ ...smokingForm, content: e.target.value })
                  }
                  placeholder="思案・課題・献策を自由に上奏せよ"
                />
              </div>
              <div style={styles.fieldRow}>
                <span style={styles.label}>印（カンマ区切り任意）</span>
                <input
                  type="text"
                  style={styles.input}
                  value={smokingForm.tags}
                  onChange={(e) =>
                    setSmokingForm({ ...smokingForm, tags: e.target.value })
                  }
                  placeholder="EC, 在庫, 至急"
                />
              </div>
              <div style={styles.fieldRow}>
                <span style={styles.label}>上奏者</span>
                <input
                  type="text"
                  style={styles.input}
                  value={smokingForm.author}
                  onChange={(e) =>
                    setSmokingForm({ ...smokingForm, author: e.target.value })
                  }
                  placeholder="氏名"
                />
              </div>
              <div style={styles.rowActions}>
                <button
                  type="button"
                  style={styles.primaryBtn(
                    !smokingForm.content.trim() || smokingPosting,
                  )}
                  disabled={!smokingForm.content.trim() || smokingPosting}
                  onClick={handleSmokingPost}
                >
                  {smokingPosting ? (
                    <span style={styles.deliberating}>奏上中…</span>
                  ) : (
                    '投稿（奏上）'
                  )}
                </button>
                <button
                  type="button"
                  style={styles.secondaryBtn(smokingProcessing)}
                  disabled={smokingProcessing}
                  onClick={handleSmokingProcess}
                >
                  {smokingProcessing ? (
                    <span style={styles.deliberating}>議事中…</span>
                  ) : (
                    'AI処理（議事）'
                  )}
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <div style={styles.label}>
                  未処理上奏（{smokingList.length}）
                </div>
                <button
                  type="button"
                  style={styles.secondaryBtn(smokingListLoading)}
                  disabled={smokingListLoading}
                  onClick={loadSmokingList}
                >
                  {smokingListLoading ? '閲覧中…' : '再閲覧'}
                </button>
              </div>
              {smokingList.length === 0 ? (
                <div style={styles.emptyHistory}>
                  {smokingListLoading ? '閲覧中…' : '未処理なし'}
                </div>
              ) : (
                smokingList.map((s, i) => (
                  <div key={s['喫煙所ID'] || i} style={styles.smokingItem}>
                    <div>
                      <span style={styles.badge}>{s['喫煙所ID']}</span>
                      <span style={styles.meta}>{formatTimestamp(s['日時'])}</span>
                      {s['投稿者'] && (
                        <span style={{ ...styles.meta, marginLeft: 8 }}>
                          by {s['投稿者']}
                        </span>
                      )}
                      {s['タグ'] && (
                        <span style={{ ...styles.meta, marginLeft: 8 }}>
                          #{s['タグ']}
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#e8e8e8', marginTop: 2 }}>
                      {s['内容']}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'genroin' && (
          <div style={styles.card}>
            <div style={styles.placeholder}>
              議事の間 — Phase 3 にて開廷予定
            </div>
          </div>
        )}

        {activeTab === 'task' && (
          <div style={styles.card}>
            <div style={styles.placeholder}>
              勅命の間 — Phase 3 にて開設予定
            </div>
          </div>
        )}
      </div>
      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  )
}
