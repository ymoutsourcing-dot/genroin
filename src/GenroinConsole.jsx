import { useState } from 'react'

const CATEGORIES = ['EC', '買取', '新規事業', '管理']

const INPUT_TEMPLATE =
  '【カテゴリ】\nEC / 買取 / 新規事業 / 管理\n\n【現状】\n\n【課題】\n\n【判断したいこと】\n'

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f6f7f9',
    color: '#1a1a1a',
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
  title: { fontSize: 22, fontWeight: 700, margin: 0 },
  subtitle: { fontSize: 13, color: '#666', margin: 0 },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  fieldRow: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: 600, color: '#444' },
  catRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  catBtn: (active) => ({
    padding: '8px 14px',
    borderRadius: 999,
    border: '1px solid ' + (active ? '#111' : '#d1d5db'),
    background: active ? '#111' : '#fff',
    color: active ? '#fff' : '#333',
    fontSize: 13,
    cursor: 'pointer',
  }),
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    boxSizing: 'border-box',
    background: '#fff',
    color: '#1a1a1a',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    minHeight: 120,
    resize: 'vertical',
    boxSizing: 'border-box',
    background: '#fff',
    color: '#1a1a1a',
    fontFamily: 'inherit',
  },
  uploadRow: { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  thumb: {
    width: 80,
    height: 80,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
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
    background: '#111',
    color: '#fff',
    fontSize: 12,
    lineHeight: '20px',
    cursor: 'pointer',
    padding: 0,
  },
  fileBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px dashed #9ca3af',
    background: '#fafafa',
    fontSize: 13,
    cursor: 'pointer',
    color: '#444',
  },
  runBtn: (disabled) => ({
    padding: '12px 20px',
    borderRadius: 10,
    border: 'none',
    background: disabled ? '#bbb' : '#111',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: '100%',
  }),
  resultBlock: {
    background: '#fafafa',
    border: '1px solid #eee',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    lineHeight: 1.6,
  },
  resultLabel: { fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 2 },
  historyItemDyn: (important, active) => ({
    borderTop: '1px solid #f0f0f0',
    padding: '12px 10px',
    fontSize: 13,
    lineHeight: 1.55,
    background: important ? '#fffbeb' : 'transparent',
    borderLeft: important ? '3px solid #facc15' : '3px solid transparent',
    opacity: active ? 1 : 0.5,
    color: active ? 'inherit' : '#9ca3af',
    borderRadius: 4,
  }),
  badge: {
    display: 'inline-block',
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 999,
    background: '#eef2f7',
    color: '#374151',
    marginRight: 8,
  },
  badgeImportant: {
    background: '#fde68a',
    color: '#92400e',
    marginLeft: 4,
    marginRight: 0,
  },
  meta: { color: '#888', fontSize: 11 },
  emptyHistory: { color: '#999', fontSize: 13, padding: '8px 0' },
  tmplBtn: {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#374151',
    cursor: 'pointer',
  },
  flagRow: {
    display: 'flex',
    gap: 14,
    marginTop: 6,
    fontSize: 12,
    color: '#666',
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
    border: '1px solid #eab308',
    background: '#facc15',
    color: '#7c2d12',
    fontWeight: 600,
    cursor: 'pointer',
  },
  quickBtnDiscard: {
    padding: '6px 12px',
    fontSize: 12,
    borderRadius: 6,
    border: '1px solid #d1d5db',
    background: '#e5e7eb',
    color: '#374151',
    cursor: 'pointer',
  },
  quickBtnHold: {
    padding: '6px 12px',
    fontSize: 12,
    borderRadius: 6,
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#6b7280',
    cursor: 'pointer',
  },
  toast: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(17, 17, 17, 0.92)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: 999,
    fontSize: 13,
    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
    zIndex: 9999,
    pointerEvents: 'none',
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

const GAS_URL =
  'https://script.google.com/macros/s/AKfycbzGMnq2PCB2zXkpz_-a2DNH0svR-TCLJnyTqCD2Bts-YYp2ur0PUv-IQEFFJgz-Brjy/exec'

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

async function callGAS(system, user) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, user, secret: 'abc123' }),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error('GASエラー (' + res.status + '): ' + t.slice(0, 200))
  }
  const data = await res.json()
  if (data?.error) throw new Error('GASエラー: ' + data.error)
  return {
    judgment: data.judgment,
    conclusion: data.conclusion,
    reason: data.reason,
    votes: data.votes,
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
      showToast('★ 重要に登録しました')
    } else if (type === 'discard') {
      setHistory((prev) =>
        prev.map((h) => (h.id === id ? { ...h, isActive: false } : h)),
      )
      showToast('破棄しました')
    } else if (type === 'hold') {
      showToast('保留しました')
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
      const r = await callGAS(SYSTEM_PROMPT, userPrompt)
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
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>元老院コンソール</h1>
          <p style={styles.subtitle}>AI司令塔 — 指示・記録・判断の一元管理</p>
        </div>

        <div style={styles.card}>
          <div style={styles.fieldRow}>
            <span style={styles.label}>カテゴリ</span>
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
            <span style={styles.label}>案件名（自動生成・編集可）</span>
            <input
              type="text"
              style={styles.input}
              value={title}
              onChange={handleTitleChange}
              placeholder="入力すると自動で生成されます"
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
              <span style={styles.label}>入力</span>
              <button
                type="button"
                onClick={handleInsertTemplate}
                style={styles.tmplBtn}
              >
                ＋ テンプレ挿入
              </button>
            </div>
            <textarea
              style={styles.textarea}
              value={input}
              onChange={handleInputChange}
              placeholder="案件・相談内容を自由記入"
            />
          </div>

          <div style={styles.fieldRow}>
            <span style={styles.label}>画像（最大3枚・プレビューのみ）</span>
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
                  ＋ 画像を追加
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
            {loading ? '実行中…' : '実行'}
          </button>
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

        {result && (
          <div style={styles.card}>
            <div style={{ ...styles.label, marginBottom: 10 }}>結果</div>
            <div style={{ marginBottom: 8 }}>
              <span style={styles.badge}>{result.category}</span>
              <strong>{result.title}</strong>
              <span style={{ ...styles.meta, marginLeft: 8 }}>{result.timestamp}</span>
            </div>
            <div style={{ ...styles.resultBlock, marginBottom: 10 }}>
              <div style={styles.resultLabel}>判断（提案）</div>
              {result.judgment}
            </div>
            <div style={{ ...styles.resultBlock, marginBottom: 10 }}>
              <div style={styles.resultLabel}>結論</div>
              {result.conclusion}
            </div>
            <div style={styles.resultBlock}>
              <div style={styles.resultLabel}>理由</div>
              {result.reason}
            </div>
            <div style={styles.quickRow}>
              <button
                type="button"
                style={styles.quickBtnImportant}
                onClick={() => applyQuickAction(result.id, 'important')}
              >
                ★ 重要にする
              </button>
              <button
                type="button"
                style={styles.quickBtnDiscard}
                onClick={() => applyQuickAction(result.id, 'discard')}
              >
                破棄
              </button>
              <button
                type="button"
                style={styles.quickBtnHold}
                onClick={() => applyQuickAction(result.id, 'hold')}
              >
                保留
              </button>
            </div>
          </div>
        )}

        <div style={styles.card}>
          <div style={{ ...styles.label, marginBottom: 6 }}>
            履歴（最新{Math.min(history.length, 50)}件 / 最大50）
          </div>
          {history.length === 0 ? (
            <div style={styles.emptyHistory}>まだ履歴はありません</div>
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
                        ★重要
                      </span>
                    )}
                    <span style={{ ...styles.meta, marginLeft: 8 }}>
                      {h.timestamp}
                    </span>
                    {h.image_count > 0 && (
                      <span style={{ ...styles.meta, marginLeft: 8 }}>
                        画像{h.image_count}枚
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
                      重要
                    </label>
                    <label style={styles.flagLabel}>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => toggleFlag(h.id, 'isActive')}
                        disabled={!h.id}
                      />
                      検索対象
                    </label>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  )
}
