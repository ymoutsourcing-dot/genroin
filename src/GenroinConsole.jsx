import { useState, useRef, useEffect } from 'react'

const CATEGORIES = ['EC', '買取', '新規事業', '管理']

const INPUT_TEMPLATE =
  '【カテゴリ】\nEC / 買取 / 新規事業 / 管理\n\n【現状】\n\n【課題】\n\n【判断したいこと】\n'

const baseStyles = {
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
    borderBottom: active ? '3px solid #fbbf24' : '3px solid transparent',
    marginBottom: -1,
    whiteSpace: 'nowrap',
    letterSpacing: 0.5,
    textShadow: active ? '0 0 8px rgba(251,191,36,0.4)' : 'none',
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
  loadingLineWrap: {
    position: 'relative',
    width: 80,
    height: 2,
    marginTop: 6,
    overflow: 'hidden',
    borderRadius: 1,
    background: 'rgba(212,160,23,0.15)',
  },
  loadingLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    background:
      'linear-gradient(90deg, transparent, #fbbf24, transparent)',
    animation: 'genroinSlide 1.2s linear infinite',
  },
  toggleBtn: (on) => ({
    padding: '6px 14px',
    background: on ? 'linear-gradient(180deg, #fbbf24 0%, #d4a017 100%)' : '#161616',
    color: on ? '#0a0a0a' : '#9ca3af',
    border: '1px solid ' + (on ? '#d4a017' : '#3a3a3a'),
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    whiteSpace: 'nowrap',
  }),
}

function buildStyles(g) {
  // g = genroinMode (true = dark+gold regal, false = light/white normal)
  if (g) {
    // ============ ON: 黒+金 フル ============
    return {
      ...baseStyles,
      page: {
        ...baseStyles.page,
        background:
          'radial-gradient(circle at 50% 0%, rgba(251,191,36,0.10), transparent 45%), ' +
          'radial-gradient(circle at 0% 100%, rgba(59,130,246,0.08), transparent 45%), ' +
          'radial-gradient(circle at 100% 100%, rgba(212,160,23,0.05), transparent 40%), ' +
          '#000',
      },
      title: { ...baseStyles.title, color: '#fbbf24', letterSpacing: 2 },
      subtitle: { ...baseStyles.subtitle, color: '#9ca3af', letterSpacing: 1 },
      card: {
        ...baseStyles.card,
        background:
          'linear-gradient(180deg, rgba(26,26,26,0.92) 0%, rgba(20,20,20,0.92) 100%)',
        border: '1px solid rgba(251,191,36,0.25)',
        boxShadow:
          '0 0 24px rgba(251,191,36,0.10), inset 0 1px 0 rgba(212,160,23,0.08)',
        backdropFilter: 'blur(4px)',
      },
      label: { ...baseStyles.label, color: '#d4a017', letterSpacing: 1 },
      resultLabel: { ...baseStyles.resultLabel, color: '#d4a017', letterSpacing: 1 },
      badge: { ...baseStyles.badge, background: '#2a2418', color: '#d4a017', letterSpacing: 0.5 },
      badgeImportant: { ...baseStyles.badgeImportant, background: '#d4a017', color: '#0a0a0a' },
      tabBtn: (active) => ({
        ...baseStyles.tabBtn(active),
        color: active ? '#fbbf24' : '#9ca3af',
        borderBottom: active ? '3px solid #fbbf24' : '3px solid transparent',
        textShadow: active ? '0 0 8px rgba(251,191,36,0.4)' : 'none',
      }),
      quickBtnImportant: { ...baseStyles.quickBtnImportant },
    }
  }
  // ============ OFF: 白基調ライトテーマ ============
  return {
    ...baseStyles,
    page: {
      ...baseStyles.page,
      background: '#f6f7f9',
      color: '#1a1a1a',
    },
    title: { ...baseStyles.title, color: '#1a1a1a', letterSpacing: 0 },
    subtitle: { ...baseStyles.subtitle, color: '#666', letterSpacing: 0 },
    card: {
      ...baseStyles.card,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    label: { ...baseStyles.label, color: '#444', letterSpacing: 0 },
    input: {
      ...baseStyles.input,
      background: '#ffffff',
      color: '#1a1a1a',
      border: '1px solid #d1d5db',
    },
    textarea: {
      ...baseStyles.textarea,
      background: '#ffffff',
      color: '#1a1a1a',
      border: '1px solid #d1d5db',
    },
    catBtn: (active) => ({
      ...baseStyles.catBtn(active),
      border: '1px solid ' + (active ? '#111' : '#d1d5db'),
      background: active ? '#111' : '#ffffff',
      color: active ? '#fff' : '#333',
      fontWeight: active ? 700 : 500,
    }),
    runBtn: (disabled) => ({
      ...baseStyles.runBtn(disabled),
      border: 'none',
      background: disabled ? '#bbbbbb' : '#111',
      color: '#fff',
      letterSpacing: 0,
      boxShadow: 'none',
    }),
    primaryBtn: (disabled) => ({
      ...baseStyles.primaryBtn(disabled),
      border: 'none',
      background: disabled ? '#bbbbbb' : '#111',
      color: '#fff',
      letterSpacing: 0,
    }),
    secondaryBtn: (disabled) => ({
      ...baseStyles.secondaryBtn(disabled),
      border: '1px solid #d1d5db',
      background: '#ffffff',
      color: disabled ? '#aaa' : '#374151',
    }),
    resultBlock: {
      ...baseStyles.resultBlock,
      background: '#fafafa',
      border: '1px solid #eee',
      color: '#1a1a1a',
    },
    resultLabel: { ...baseStyles.resultLabel, color: '#888', letterSpacing: 0 },
    historyItemDyn: (important, active) => ({
      ...baseStyles.historyItemDyn(important, active),
      borderTop: '1px solid #f0f0f0',
      background: important ? '#fffbeb' : 'transparent',
      borderLeft: important ? '3px solid #facc15' : '3px solid transparent',
      color: active ? '#1a1a1a' : '#9ca3af',
      opacity: active ? 1 : 0.5,
    }),
    badge: { ...baseStyles.badge, background: '#eef2f7', color: '#374151', letterSpacing: 0 },
    badgeImportant: { ...baseStyles.badgeImportant, background: '#fde68a', color: '#92400e' },
    meta: { ...baseStyles.meta, color: '#888' },
    emptyHistory: { ...baseStyles.emptyHistory, color: '#999', fontStyle: 'normal' },
    tmplBtn: { ...baseStyles.tmplBtn, border: '1px solid #d1d5db', background: '#ffffff', color: '#374151' },
    flagRow: { ...baseStyles.flagRow, color: '#666' },
    tabBar: { ...baseStyles.tabBar, borderBottom: '1px solid #e5e7eb' },
    tabBtn: (active) => ({
      ...baseStyles.tabBtn(active),
      color: active ? '#111' : '#6b7280',
      borderBottom: active ? '3px solid #111' : '3px solid transparent',
      textShadow: 'none',
    }),
    smokingItem: { ...baseStyles.smokingItem, borderTop: '1px solid #f0f0f0' },
    placeholder: { ...baseStyles.placeholder, color: '#9ca3af', fontStyle: 'normal' },
    quickBtnImportant: { ...baseStyles.quickBtnImportant, border: '1px solid #eab308', background: '#facc15', color: '#7c2d12' },
    quickBtnDiscard: { ...baseStyles.quickBtnDiscard, border: '1px solid #d1d5db', background: '#e5e7eb', color: '#374151' },
    quickBtnHold: { ...baseStyles.quickBtnHold, border: '1px solid #d1d5db', background: '#ffffff', color: '#6b7280' },
    fileBtn: { ...baseStyles.fileBtn, border: '1px dashed #9ca3af', background: '#fafafa', color: '#444' },
    thumb: { ...baseStyles.thumb, border: '1px solid #e5e7eb' },
    thumbRemove: { ...baseStyles.thumbRemove, background: '#111', color: '#fff' },
    toast: {
      ...baseStyles.toast,
      background: 'rgba(17,17,17,0.92)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
      fontWeight: 600,
      letterSpacing: 0,
    },
    deliberating: { ...baseStyles.deliberating, color: '#111' },
    loadingLineWrap: { ...baseStyles.loadingLineWrap, background: 'rgba(17,17,17,0.1)' },
    loadingLine: { ...baseStyles.loadingLine, background: 'linear-gradient(90deg, transparent, #111, transparent)' },
    toggleBtn: (on) => ({
      ...baseStyles.toggleBtn(on),
      background: on ? 'linear-gradient(180deg, #fbbf24 0%, #d4a017 100%)' : '#ffffff',
      color: on ? '#0a0a0a' : '#374151',
      border: '1px solid ' + (on ? '#d4a017' : '#d1d5db'),
    }),
  }
}

// ============ サイドパネル ============

function LeftPanelNormal({ stats }) {
  return (
    <div className="panel">
      <h3>状況</h3>
      <div className="stat"><span>未処理</span><b>{stats.unprocessed}</b></div>
      <div className="stat"><span>進行中</span><b>{stats.inProgress}</b></div>
      <div className="stat"><span>完了</span><b>{stats.done}</b></div>
    </div>
  )
}

function RightPanelNormal({ history, backupProps }) {
  return (
    <div className="panel">
      <h3>クイックメモ</h3>
      <textarea placeholder="メモ..." />
      <h3 style={{ marginTop: 20 }}>履歴</h3>
      <ul>
        {history.length === 0 ? (
          <li style={{ opacity: 0.5 }}>まだありません</li>
        ) : (
          history.slice(0, 5).map((h, i) => (
            <li key={h.id || i}>{(h.title || '').slice(0, 24)}</li>
          ))
        )}
      </ul>
      <BackupSection {...backupProps} />
    </div>
  )
}

function LeftPanelGenroin({ stats }) {
  return (
    <div className="panel genroin">
      <h3>戦況</h3>
      <div className="stat"><span>議題</span><b>{stats.genroin}</b></div>
      <div className="stat"><span>勅命</span><b>{stats.task}</b></div>
      <div className="stat"><span>保留</span><b>{stats.unprocessed}</b></div>
      <div className="scan-line" />
    </div>
  )
}

function RightPanelGenroin({ recent, summary, suggestion, fallback, loading, error, onRefresh, backupProps, actionables, busyId, onOneClick }) {
  return (
    <div className="panel genroin">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0 }}>🤖 AI進言</h3>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          style={{
            background: 'transparent',
            border: '1px solid rgba(251,191,36,0.5)',
            color: '#fbbf24',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 11,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '…' : '再進言'}
        </button>
      </div>
      {loading ? (
        <div className="ai-box" style={{ opacity: 0.7 }}>
          分析中…
          <div
            style={{
              marginTop: 6,
              height: 2,
              overflow: 'hidden',
              borderRadius: 1,
              background: 'rgba(212,160,23,0.15)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '50%',
                height: '100%',
                background:
                  'linear-gradient(90deg, transparent, #fbbf24, transparent)',
                animation: 'genroinSlide 1.2s linear infinite',
              }}
            />
          </div>
        </div>
      ) : error ? (
        <div className="ai-box" style={{ borderColor: '#7f1d1d', color: '#fecaca' }}>
          {error}
          <div style={{ fontSize: 11, marginTop: 6, opacity: 0.7 }}>
            （ローカル推論：{fallback}）
          </div>
        </div>
      ) : suggestion ? (
        <div className="ai-box">{suggestion}</div>
      ) : (
        <div className="ai-box" style={{ opacity: 0.7 }}>
          {fallback}
          <div style={{ fontSize: 11, marginTop: 6, opacity: 0.6 }}>
            （ローカル推論。「再進言」で GPT 分析）
          </div>
        </div>
      )}
      {actionables && actionables.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {actionables.map((a) => {
            const busy = busyId === a.id
            const adopted = a.adoption === 'Yes'
            return (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 8px',
                  borderRadius: 6,
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.3)',
                  fontSize: 11,
                }}
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong style={{ color: '#fbbf24' }}>{a.id}</strong>
                  {' '}
                  {a.title.slice(0, 14)}
                </span>
                <button
                  type="button"
                  onClick={() => onOneClick(a.id)}
                  disabled={busy}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 4,
                    border: '1px solid #fbbf24',
                    background: busy ? 'transparent' : 'linear-gradient(180deg, #fbbf24 0%, #d4a017 100%)',
                    color: busy ? '#fbbf24' : '#0a0a0a',
                    cursor: busy ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {busy ? '実行中…' : adopted ? '勅命化' : '即実行'}
                </button>
              </div>
            )
          })}
        </div>
      )}
      <h3 style={{ marginTop: 20 }}>議事ログ</h3>
      <ul className="log">
        {recent.length === 0 ? (
          <li style={{ opacity: 0.5 }}>記録なし</li>
        ) : (
          recent.slice(0, 5).map((r, i) => (
            <li key={r.id || i}>{r.label}</li>
          ))
        )}
      </ul>
      <h3 style={{ marginTop: 20 }}>優先度</h3>
      <p style={{ fontSize: 12, opacity: 0.85, margin: 0 }}>{summary}</p>
      <BackupSection {...backupProps} />
    </div>
  )
}

function formatBackupName(b) {
  // genroin_backup_20260427_103000.json → 04/27 10:30:00
  const m = String(b.name || '').match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/)
  if (m) return m[2] + '/' + m[3] + ' ' + m[4] + ':' + m[5]
  return formatTimestamp(b.date)
}

function BackupSection({ backups, loading, busy, restoreBusy, onLoad, onCreate, onRestore }) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 20,
          marginBottom: 8,
        }}
      >
        <h3 style={{ margin: 0 }}>💾 バックアップ</h3>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => onCreate('manual')}
            disabled={busy}
            style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 4,
              cursor: busy ? 'not-allowed' : 'pointer',
              background: 'transparent',
              border: '1px solid currentColor',
              color: 'inherit',
              opacity: busy ? 0.5 : 1,
            }}
          >
            {busy ? '作成中…' : '＋作成'}
          </button>
          <button
            type="button"
            onClick={onLoad}
            disabled={loading}
            style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              background: 'transparent',
              border: '1px solid currentColor',
              color: 'inherit',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? '↻' : '↻'}
          </button>
        </div>
      </div>
      <ul>
        {backups.length === 0 ? (
          <li style={{ opacity: 0.5, fontSize: 12 }}>
            {loading ? '取得中…' : 'バックアップなし'}
          </li>
        ) : (
          backups.slice(0, 8).map((b) => (
            <li
              key={b.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 11, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formatBackupName(b)}
              </span>
              <button
                type="button"
                onClick={() => onRestore(b.id, b.name)}
                disabled={restoreBusy}
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 3,
                  cursor: restoreBusy ? 'not-allowed' : 'pointer',
                  background: 'transparent',
                  border: '1px solid currentColor',
                  color: 'inherit',
                  opacity: restoreBusy ? 0.4 : 1,
                  flexShrink: 0,
                }}
              >
                復元
              </button>
            </li>
          ))
        )}
      </ul>
    </>
  )
}

const layoutCss = `
/* 支配型レイアウト */
.layout { display: flex; gap: 20px; max-width: 1800px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; justify-content: center; }
.side { width: 260px; flex-shrink: 0; }
.main { flex: 1; max-width: 1100px; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
/* sticky タブバー */
.sticky-tab { position: sticky; top: 0; z-index: 50; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
/* PWAバナー */
.pwa-banner { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; font-size: 12px; }
.pwa-banner button { padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; }
/* iOS safe-area + モバイル余白 */
.layout { padding-bottom: env(safe-area-inset-bottom); padding-top: env(safe-area-inset-top); }
/* タッチ最適化 */
button { min-height: 32px; }

/* パネル共通 */
.panel { padding: 18px; border-radius: 12px; }
.panel h3 { margin: 0 0 12px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; }
.panel textarea { width: 100%; min-height: 80px; border-radius: 6px; padding: 8px; font-family: inherit; font-size: 13px; box-sizing: border-box; resize: vertical; }
.panel ul { list-style: none; padding: 0; margin: 0; font-size: 13px; line-height: 1.7; }
.panel ul li { padding: 4px 0; }
.stat { display: flex; justify-content: space-between; margin: 8px 0; font-size: 13px; }
.stat b { font-variant-numeric: tabular-nums; font-size: 16px; }

/* OFF 通常モード */
.side.off .panel { background: #ffffff; border: 1px solid #e5e7eb; color: #1a1a1a; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.side.off .panel h3 { color: #444; }
.side.off .panel textarea { border: 1px solid #d1d5db; background: #ffffff; color: #1a1a1a; }
.side.off .panel ul li { border-bottom: 1px solid #f0f0f0; }

/* ON 元老院モード — backdrop-filter で浮く */
.side.on .panel { background: rgba(10,10,10,0.65); border: 1px solid rgba(251,191,36,0.5); color: #f5f5f5; box-shadow: 0 0 12px rgba(251,191,36,0.12); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.side.on .panel h3 { color: #fbbf24; letter-spacing: 1.5px; }
.side.on .panel textarea { border: 1px solid #3a2f15; background: #0d0d0d; color: #e8e8e8; }
.side.on .panel ul li { border-bottom: 1px solid rgba(212,160,23,0.15); }

/* スキャンライン */
.scan-line { margin-top: 20px; height: 2px; background: linear-gradient(90deg, transparent, #fbbf24, transparent); animation: genroinScan 2.4s linear infinite; }
.log { opacity: 0.9; }

/* AI進言ボックス */
.ai-box { border: 1px solid #fbbf24; padding: 12px; font-size: 13px; line-height: 1.6; background: rgba(0,0,0,0.6); box-shadow: 0 0 10px rgba(251,191,36,0.2); border-radius: 6px; color: #fef3c7; }

@keyframes genroinScan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
@keyframes genroinHighlight { 0%,100% { box-shadow: 0 0 0 rgba(251,191,36,0); } 50% { box-shadow: 0 0 16px rgba(251,191,36,0.7); } }
.highlight-target { outline: 2px solid #fbbf24; outline-offset: 3px; border-radius: 6px; animation: genroinHighlight 1.2s ease 0s 3; }
@media (max-width: 1100px) { .side { display: none; } .layout { padding: 0 12px; max-width: 100%; } .main { min-width: 0; } }
@media (max-width: 700px) { .layout { padding: 0 8px; gap: 0; } .main { gap: 12px; } }
`

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
const GAS_SECRET = 'vXrkAMH0xcSbnnWwgo5sO4EFGZdLHVzdetYoXVcG'

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

function priorityBadgeStyle(p, g) {
  const v = String(p || '').toUpperCase()
  const dark = {
    A: { bg: '#7f1d1d', fg: '#fecaca' },
    B: { bg: '#78350f', fg: '#fde68a' },
    C: { bg: '#1f2937', fg: '#9ca3af' },
  }
  const light = {
    A: { bg: '#fee2e2', fg: '#991b1b' },
    B: { bg: '#fef3c7', fg: '#92400e' },
    C: { bg: '#f3f4f6', fg: '#4b5563' },
  }
  const c = (g ? dark : light)[v] || (g ? dark : light).C
  return {
    display: 'inline-block',
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 999,
    background: c.bg,
    color: c.fg,
    marginLeft: 4,
    fontWeight: 700,
  }
}

function adoptionBadgeStyle(a, g) {
  const isYes = a === 'Yes'
  const dark = isYes
    ? { bg: '#064e3b', fg: '#6ee7b7' }
    : { bg: '#7f1d1d', fg: '#fecaca' }
  const light = isYes
    ? { bg: '#d1fae5', fg: '#065f46' }
    : { bg: '#fee2e2', fg: '#991b1b' }
  const c = g ? dark : light
  return {
    display: 'inline-block',
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 999,
    background: c.bg,
    color: c.fg,
    marginLeft: 4,
    fontWeight: 700,
  }
}

function statusBadgeStyle(s, g) {
  const dark = {
    未着手: { bg: '#1f2937', fg: '#9ca3af' },
    進行中: { bg: '#78350f', fg: '#fde68a' },
    完了: { bg: '#064e3b', fg: '#6ee7b7' },
    中止: { bg: '#7f1d1d', fg: '#fecaca' },
  }
  const light = {
    未着手: { bg: '#f3f4f6', fg: '#4b5563' },
    進行中: { bg: '#fef3c7', fg: '#92400e' },
    完了: { bg: '#d1fae5', fg: '#065f46' },
    中止: { bg: '#fee2e2', fg: '#991b1b' },
  }
  const c = (g ? dark : light)[s] || (g ? dark : light)['未着手']
  return {
    display: 'inline-block',
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 999,
    background: c.bg,
    color: c.fg,
    marginLeft: 8,
    fontWeight: 700,
  }
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
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'judge'
    const t = new URLSearchParams(window.location.search).get('tab')
    return ['judge', 'smoking', 'genroin', 'task'].indexOf(t) >= 0 ? t : 'judge'
  })
  const [smokingForm, setSmokingForm] = useState({ content: '', tags: '', author: '' })
  const [smokingList, setSmokingList] = useState([])
  const [smokingListLoading, setSmokingListLoading] = useState(false)
  const [smokingPosting, setSmokingPosting] = useState(false)
  const [smokingProcessing, setSmokingProcessing] = useState(false)

  // 元老院モード（C: 装飾＋文言の強度切替、ダーク維持）
  const [genroinMode, setGenroinMode] = useState(false)
  const T = (regal, normal) => (genroinMode ? regal : normal)
  const styles = buildStyles(genroinMode)

  // 議事（元老院）
  const [genroinList, setGenroinList] = useState([])
  const [genroinLoading, setGenroinLoading] = useState(false)
  const [genroinMemoEdits, setGenroinMemoEdits] = useState({}) // {id: memo}
  const [genroinBusyId, setGenroinBusyId] = useState(null) // id currently being updated
  const [aiReviewBusyId, setAiReviewBusyId] = useState(null) // id currently being AI-reviewed

  // 勅命（案件）
  const [taskList, setTaskList] = useState([])
  const [taskLoading, setTaskLoading] = useState(false)
  const [logOpenId, setLogOpenId] = useState(null) // taskId whose log form is open
  const [logForm, setLogForm] = useState({ result: '', success: '', learning: '' })
  const [logBusy, setLogBusy] = useState(false)

  // AI進言（GPT）
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [oneClickBusyId, setOneClickBusyId] = useState(null)

  // バックアップ
  const [backups, setBackups] = useState([])
  const [backupsLoading, setBackupsLoading] = useState(false)
  const [backupBusy, setBackupBusy] = useState(false)
  const [restoreBusy, setRestoreBusy] = useState(false)

  // PWAインストール
  const [installEvent, setInstallEvent] = useState(null)
  const [installDismissed, setInstallDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('pwaInstallDismissed') === '1'
    } catch {
      return false
    }
  })

  // 通知ディスミス（sessionStorage）
  const [notifDismissed, setNotifDismissed] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('notifDismissed') || '[]')
    } catch {
      return []
    }
  })
  // 期限超過判定の基準日（render 中の Date.now() 純度警告回避：初回 mount 時に確定）
  const [todayIso] = useState(() => new Date().toISOString().slice(0, 10))

  // Deep Link：URLからの id 参照（mount時に初期化）
  const [targetId, setTargetId] = useState(() => {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search).get('id')
  })


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
    if (next === 'genroin' && genroinList.length === 0) loadGenroinList()
    if (next === 'task' && taskList.length === 0) loadTaskList()
    // 議事/勅命タブで genroinモード時、AI進言が未取得なら自動 fetch
    if (
      genroinMode &&
      (next === 'genroin' || next === 'task') &&
      !aiSuggestion &&
      !aiLoading
    ) {
      // 少し遅延（list取得を先行させる）
      setTimeout(() => loadAiSuggestion(), 300)
    }
  }

  // ===== 議事（元老院） =====
  const loadGenroinList = async () => {
    setGenroinLoading(true)
    setError('')
    try {
      const r = await callGAS('list', { sheet: '元老院' })
      setGenroinList(Array.isArray(r.items) ? r.items : [])
      setGenroinMemoEdits({})
      clearNotifDismiss('priority-a')
    } catch (e) {
      setError(e?.message || '議事一覧取得失敗')
    } finally {
      setGenroinLoading(false)
    }
  }

  const handleAdoption = async (id, value) => {
    if (genroinBusyId) return
    setGenroinBusyId(id)
    setError('')
    try {
      await callGAS('updateGenroin', { genroinId: id, adoption: value })
      showToast(T('採用可否更新: ', '採用更新: ') + (value || T('未決', '未決定')))
      setAiSuggestion(null)
      await loadGenroinList()
    } catch (e) {
      setError(e?.message || '採用可否更新失敗')
    } finally {
      setGenroinBusyId(null)
    }
  }

  const handleSaveMemo = async (id) => {
    if (genroinBusyId) return
    const memo = genroinMemoEdits[id] || ''
    setGenroinBusyId(id)
    setError('')
    try {
      await callGAS('updateGenroin', { genroinId: id, memo })
      showToast(T('御記録: 保存', 'メモ: 保存'))
      await loadGenroinList()
    } catch (e) {
      setError(e?.message || 'メモ保存失敗')
    } finally {
      setGenroinBusyId(null)
    }
  }

  const handleAiReview = async (id) => {
    if (aiReviewBusyId) return
    setAiReviewBusyId(id)
    setError('')
    try {
      const r = await callGAS('aiReview', { genroinId: id })
      setGenroinList((list) =>
        list.map((g) =>
          g['元老院ID'] === id ? { ...g, 'AI審議コメント': r.review } : g,
        ),
      )
      showToast(T('御審議: 完了', 'AI審議: 完了'))
    } catch (e) {
      setError(e?.message || 'AI審議失敗')
    } finally {
      setAiReviewBusyId(null)
    }
  }

  const handleCreateTask = async (id) => {
    if (genroinBusyId) return
    setGenroinBusyId(id)
    setError('')
    try {
      const r = await callGAS('createTask', { genroinId: id })
      showToast(T('勅命下達: ', '案件作成: ') + r.taskId)
      setAiSuggestion(null)
      await loadGenroinList()
      if (taskList.length > 0) await loadTaskList()
    } catch (e) {
      setError(e?.message || '勅命下達失敗')
    } finally {
      setGenroinBusyId(null)
    }
  }

  // ===== 勅命（案件） =====
  const loadTaskList = async () => {
    setTaskLoading(true)
    setError('')
    try {
      const r = await callGAS('list', { sheet: '案件' })
      setTaskList(Array.isArray(r.items) ? r.items : [])
      clearNotifDismiss('overdue-task')
    } catch (e) {
      setError(e?.message || '勅命一覧取得失敗')
    } finally {
      setTaskLoading(false)
    }
  }

  const openLogForm = (taskId) => {
    if (logOpenId === taskId) {
      setLogOpenId(null)
    } else {
      setLogOpenId(taskId)
      setLogForm({ result: '', success: '', learning: '' })
    }
  }

  const handleAddLog = async (taskId) => {
    if (logBusy) return
    if (!logForm.result.trim()) {
      setError('結果は必須です')
      return
    }
    setLogBusy(true)
    setError('')
    try {
      await callGAS('addLog', {
        data: {
          taskId,
          result: logForm.result.trim(),
          success: logForm.success,
          learning: logForm.learning.trim(),
        },
      })
      showToast(T('実行録: 記帳', '実行ログ: 記録'))
      setAiSuggestion(null)
      setLogOpenId(null)
      setLogForm({ result: '', success: '', learning: '' })
      await loadTaskList()
    } catch (e) {
      setError(e?.message || '実行録追加失敗')
    } finally {
      setLogBusy(false)
    }
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
      showToast(T('奏上完了: ', '投稿しました: ') + r.id)
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
        showToast(T('未処理なし', '未処理ゼロ'))
      } else {
        showToast(
          T(n + '件を議に付しました（失敗' + errN + '）', 'AI処理 ' + n + '件 (失敗' + errN + ')'),
        )
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
      showToast(T('★ 勅令として記録', '★ 重要に登録しました'))
    } else if (type === 'discard') {
      setHistory((prev) =>
        prev.map((h) => (h.id === id ? { ...h, isActive: false } : h)),
      )
      showToast(T('却下', '破棄しました'))
    } else if (type === 'hold') {
      showToast(T('持ち越し', '保留しました'))
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

  // AI進言テキストから C-YYYYMMDD-NNN 形式の議題IDを抽出してアクション化
  const aiActionables = (() => {
    if (!aiSuggestion) return []
    const matches = String(aiSuggestion).match(/C-\d{8}-\d{3}/g) || []
    const unique = Array.from(new Set(matches))
    return unique
      .map((id) => {
        const item = genroinList.find((g) => g['元老院ID'] === id)
        if (!item) return null
        return {
          id,
          title: item['タイトル'] || '',
          adoption: item['採用可否'] || '',
          priority: item['優先度'] || '',
        }
      })
      .filter((x) => x && x.adoption !== 'No') // 不採用は除外、未決と既採用は表示
  })()

  const localFallbackSuggestion = (() => {
    const high = genroinList.filter((x) => x['優先度'] === 'A')
    const pending = smokingList.length
    const undecided = genroinList.filter((x) => !x['採用可否']).length
    if (high.length > 0) return '優先度Aの議題が ' + high.length + ' 件。即時裁可を推奨。'
    if (pending > 0) return '未処理上奏が ' + pending + ' 件。議事処理を推奨。'
    if (undecided > 0) return '未決の議題が ' + undecided + ' 件。Yes/No決定を推奨。'
    if (taskList.length === 0) return '勅命が存在しません。新規案件創出を推奨。'
    return '現状は安定。改善案の探索を推奨。'
  })()

  // 通知ディスミス操作
  const dismissNotif = (id) => {
    if (notifDismissed.indexOf(id) >= 0) return
    const next = [...notifDismissed, id]
    setNotifDismissed(next)
    try { sessionStorage.setItem('notifDismissed', JSON.stringify(next)) } catch { /* ignore */ }
  }
  const clearNotifDismiss = (id) => {
    if (notifDismissed.indexOf(id) < 0) return
    const next = notifDismissed.filter((x) => x !== id)
    setNotifDismissed(next)
    try { sessionStorage.setItem('notifDismissed', JSON.stringify(next)) } catch { /* ignore */ }
  }

  // 通知計算（render-derived）
  const isOverdueDeadline = (deadline) => {
    if (!deadline) return false
    const d = String(deadline).slice(0, 10) // YYYY-MM-DD prefix
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false
    return d.localeCompare(todayIso) < 0
  }
  const priorityAUndecided = genroinList.filter(
    (g) => g['優先度'] === 'A' && !g['採用可否'],
  )
  const overdueTasks = taskList.filter((t) => {
    const s = t['ステータス']
    if (s === '完了' || s === '中止') return false
    return isOverdueDeadline(t['期限'])
  })
  const allNotifications = []
  if (priorityAUndecided.length > 0) {
    allNotifications.push({
      id: 'priority-a',
      icon: '⚠',
      severity: 'critical',
      message:
        '優先度A 議題 ' + priorityAUndecided.length + ' 件 採用判断待ち',
      tab: 'genroin',
    })
  }
  if (overdueTasks.length > 0) {
    allNotifications.push({
      id: 'overdue-task',
      icon: '⏰',
      severity: 'warn',
      message: '期限超過勅命 ' + overdueTasks.length + ' 件',
      tab: 'task',
    })
  }
  const visibleNotifications = allNotifications.filter(
    (n) => notifDismissed.indexOf(n.id) < 0,
  )

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallEvent(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Deep Link：mount 時に activeTab（初期値=URLのtab）に応じてリストロードをキック（setState せず）
  useEffect(() => {
    if (activeTab === 'smoking') loadSmokingList()
    else if (activeTab === 'genroin') loadGenroinList()
    else if (activeTab === 'task') loadTaskList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 対象アイテムが描画されたら scroll + ハイライト
  useEffect(() => {
    if (!targetId) return
    const t = window.setTimeout(() => {
      const el = document.getElementById('item-' + targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 200)
    const t2 = window.setTimeout(() => setTargetId(null), 4000)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(t2)
    }
  }, [targetId, genroinList, taskList, smokingList])

  const handleCopyLink = async (tab, id) => {
    const url =
      window.location.origin +
      window.location.pathname +
      '?tab=' +
      tab +
      '&id=' +
      encodeURIComponent(id)
    try {
      await navigator.clipboard.writeText(url)
      showToast('🔗 リンクコピー: ' + id)
    } catch {
      // フォールバック
      window.prompt('コピーしてください', url)
    }
  }

  const handleInstall = async () => {
    if (!installEvent) return
    installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
  }

  const dismissInstall = () => {
    try { sessionStorage.setItem('pwaInstallDismissed', '1') } catch { /* ignore */ }
    setInstallDismissed(true)
  }

  // スワイプでタブ切替
  const tabKeys = ['judge', 'smoking', 'genroin', 'task']
  const swipeStart = useRef({ x: 0, y: 0, t: 0 })
  const handleTouchStart = (e) => {
    const t = e.touches[0]
    swipeStart.current.x = t.clientX
    swipeStart.current.y = t.clientY
    swipeStart.current.t = e.timeStamp
  }
  const handleTouchEnd = (e) => {
    const t = e.changedTouches[0]
    const dx = t.clientX - swipeStart.current.x
    const dy = t.clientY - swipeStart.current.y
    const dt = e.timeStamp - swipeStart.current.t
    if (dt > 600) return
    if (Math.abs(dx) < 80) return
    if (Math.abs(dy) > Math.abs(dx) * 0.6) return // 縦が強いとスクロール扱い
    const idx = tabKeys.indexOf(activeTab)
    if (idx < 0) return
    const next = dx < 0 ? idx + 1 : idx - 1
    if (next < 0 || next >= tabKeys.length) return
    handleTabChange(tabKeys[next])
  }

  const loadBackups = async () => {
    setBackupsLoading(true)
    setError('')
    try {
      const r = await callGAS('listBackups')
      setBackups(Array.isArray(r.files) ? r.files : [])
    } catch (e) {
      setError(e?.message || 'バックアップ一覧取得失敗')
    } finally {
      setBackupsLoading(false)
    }
  }

  const createBackup = async (note) => {
    if (backupBusy) return
    setBackupBusy(true)
    setError('')
    try {
      const r = await callGAS('backup', { note: note || '' })
      showToast('バックアップ作成: ' + r.name)
      await loadBackups()
      return r
    } catch (e) {
      setError(e?.message || 'バックアップ失敗')
      throw e
    } finally {
      setBackupBusy(false)
    }
  }

  const restoreBackup = async (fileId, fileName) => {
    if (restoreBusy) return
    if (!window.confirm(
      '復元しますか？\n\n対象: ' + fileName +
      '\n\n現在のシートは全て上書きされます。\n（自動で事前バックアップを取ります）'
    )) return
    setRestoreBusy(true)
    setError('')
    try {
      // 事前自動バックアップ（保険）
      try {
        await createBackup('auto-pre-restore')
      } catch (e) {
        // 事前バックアップ失敗時、ユーザーに継続するか確認
        if (!window.confirm('事前バックアップに失敗しました：\n' + (e?.message || '') + '\n\nそれでも復元を続けますか？')) {
          setRestoreBusy(false)
          return
        }
      }
      const r = await callGAS('restore', { fileId })
      showToast('復元完了: ' + (r.sourceName || fileName))
      // 全リスト再読込
      setSmokingList([])
      setGenroinList([])
      setTaskList([])
      setAiSuggestion(null)
      if (activeTab === 'smoking') await loadSmokingList()
      if (activeTab === 'genroin') await loadGenroinList()
      if (activeTab === 'task') await loadTaskList()
      await loadBackups()
    } catch (e) {
      setError(e?.message || '復元失敗')
    } finally {
      setRestoreBusy(false)
    }
  }

  // ワンクリック実行：AI進言中の議題IDを採用＋勅命化
  const handleOneClick = async (id) => {
    if (oneClickBusyId) return
    const item = genroinList.find((g) => g['元老院ID'] === id)
    if (!item) {
      setError('議題が見つかりません: ' + id)
      return
    }
    setOneClickBusyId(id)
    setError('')
    try {
      // 未採用なら Yes に
      if (item['採用可否'] !== 'Yes') {
        await callGAS('updateGenroin', { genroinId: id, adoption: 'Yes' })
      }
      // 勅命作成
      const r = await callGAS('createTask', { genroinId: id })
      showToast('勅命下達: ' + r.taskId)
      setAiSuggestion(null)
      await loadGenroinList()
      await loadTaskList()
      // 勅命タブ移動オファー
      if (window.confirm('勅命下達: ' + r.taskId + '\n\n勅命タブへ移動しますか？')) {
        handleTabChange('task')
      }
    } catch (e) {
      setError(e?.message || 'ワンクリック失敗')
    } finally {
      setOneClickBusyId(null)
    }
  }

  const loadAiSuggestion = async () => {
    if (aiLoading) return
    setAiLoading(true)
    setAiError('')
    try {
      const r = await callGAS('aiSuggest', {
        genroin: genroinList,
        tasks: taskList,
        smoking: smokingList,
      })
      setAiSuggestion(r.suggestion || '')
    } catch (e) {
      setAiError(e?.message || 'AI進言失敗')
    } finally {
      setAiLoading(false)
    }
  }

  const canRun = input.trim().length > 0 && !loading

  // サイドパネル用の集計値
  const sideStats = {
    unprocessed: smokingList.length,
    inProgress: taskList.filter((t) => t['ステータス'] === '進行中').length,
    done: taskList.filter((t) => t['ステータス'] === '完了').length,
    genroin: genroinList.length,
    task: taskList.length,
  }
  const sideRecent = [
    ...genroinList.slice(0, 3).map((g) => ({
      id: g['元老院ID'],
      label:
        (g['タイトル'] || '').slice(0, 16) + ' → ' + (g['採用可否'] || '未決'),
    })),
    ...taskList.slice(0, 2).map((t) => ({
      id: t['案件ID'],
      label:
        (t['タイトル'] || '').slice(0, 16) + ' / ' + (t['ステータス'] || '未着手'),
    })),
  ]
  const sideSummary = (() => {
    if (genroinList.length === 0) return '判断データなし'
    const c = { A: 0, B: 0, C: 0 }
    genroinList.forEach((g) => {
      if (c[g['優先度']] !== undefined) c[g['優先度']]++
    })
    const top = ['A', 'B', 'C'].reduce((a, b) => (c[a] >= c[b] ? a : b))
    return '優先度 ' + top + ' が ' + c[top] + ' 件 多数'
  })()

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes genroinPulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
        @keyframes genroinSlide { 0% { left: -50% } 100% { left: 100% } }
        ${layoutCss}
      `}</style>
      <div className="layout">
        <aside className={'side left ' + (genroinMode ? 'on' : 'off')}>
          {genroinMode ? (
            <LeftPanelGenroin stats={sideStats} />
          ) : (
            <LeftPanelNormal stats={sideStats} />
          )}
        </aside>

        <main
          className="main"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{T('元 老 院', '元老院')}</h1>
            <p style={styles.subtitle}>
              {T('御 前 会 議 — 裁可と記録の一元', 'AI司令塔 — 指示・記録・判断')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setGenroinMode((v) => !v)}
            style={styles.toggleBtn(genroinMode)}
          >
            元老院モード {genroinMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {visibleNotifications.map((n) => {
          const colors =
            n.severity === 'critical'
              ? {
                  bg: genroinMode ? 'rgba(127,29,29,0.35)' : '#fef2f2',
                  border: genroinMode ? '#f87171' : '#fecaca',
                  fg: genroinMode ? '#fecaca' : '#991b1b',
                }
              : {
                  bg: genroinMode ? 'rgba(120,53,15,0.35)' : '#fffbeb',
                  border: genroinMode ? '#fbbf24' : '#fcd34d',
                  fg: genroinMode ? '#fde68a' : '#78350f',
                }
          return (
            <div
              key={n.id}
              className="pwa-banner"
              style={{
                background: colors.bg,
                border: '1px solid ' + colors.border,
                color: colors.fg,
              }}
            >
              <span style={{ flex: 1, fontWeight: 600 }}>
                {n.icon} {n.message}
              </span>
              <button
                type="button"
                onClick={() => {
                  handleTabChange(n.tab)
                  dismissNotif(n.id)
                }}
                style={{
                  background: colors.fg,
                  color: colors.bg.indexOf('rgba(127') >= 0 || colors.bg.indexOf('rgba(120') >= 0 ? '#0a0a0a' : '#fff',
                  border: 'none',
                }}
              >
                確認
              </button>
              <button
                type="button"
                onClick={() => dismissNotif(n.id)}
                style={{
                  background: 'transparent',
                  color: 'inherit',
                  border: '1px solid currentColor',
                }}
              >
                ×
              </button>
            </div>
          )
        })}

        {installEvent && !installDismissed && (
          <div
            className="pwa-banner"
            style={{
              background: genroinMode ? 'rgba(212,160,23,0.12)' : '#fef9e7',
              border: '1px solid ' + (genroinMode ? '#d4a017' : '#fbbf24'),
              color: genroinMode ? '#fbbf24' : '#7c5800',
            }}
          >
            <span style={{ flex: 1 }}>
              📱 アプリとしてインストールできます
            </span>
            <button
              type="button"
              onClick={handleInstall}
              style={{
                background: genroinMode ? '#d4a017' : '#111',
                color: genroinMode ? '#0a0a0a' : '#fff',
                border: 'none',
              }}
            >
              インストール
            </button>
            <button
              type="button"
              onClick={dismissInstall}
              style={{
                background: 'transparent',
                color: 'inherit',
                border: '1px solid currentColor',
              }}
            >
              ×
            </button>
          </div>
        )}

        <div
          className="sticky-tab"
          style={{
            ...styles.tabBar,
            background: genroinMode ? 'rgba(10,10,10,0.7)' : 'rgba(246,247,249,0.85)',
          }}
        >
          {[
            { key: 'judge', label: T('即決（AI判断）', 'AI判断') },
            { key: 'smoking', label: T('上奏（喫煙所）', '喫煙所') },
            { key: 'genroin', label: T('議事（元老院）', '元老院') },
            { key: 'task', label: T('勅命（案件）', '案件') },
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
              borderColor: genroinMode ? '#7f1d1d' : '#fecaca',
              background: genroinMode ? '#1f0a0a' : '#fef2f2',
              color: genroinMode ? '#fecaca' : '#b91c1c',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {activeTab === 'judge' && (<>

        <div style={styles.card}>
          <div style={styles.fieldRow}>
            <span style={styles.label}>{T('議題', 'カテゴリ')}</span>
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
            <span style={styles.label}>
              {T('議題名（自動生成・編集可）', '案件名（自動生成・編集可）')}
            </span>
            <input
              type="text"
              style={styles.input}
              value={title}
              onChange={handleTitleChange}
              placeholder={T('上奏内容より自動生成', '入力すると自動で生成されます')}
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
              <span style={styles.label}>{T('上奏内容', '入力')}</span>
              <button
                type="button"
                onClick={handleInsertTemplate}
                style={styles.tmplBtn}
              >
                {T('＋ 定型奏上', '＋ テンプレ挿入')}
              </button>
            </div>
            <textarea
              style={styles.textarea}
              value={input}
              onChange={handleInputChange}
              placeholder={T('御諮問の趣旨を述べよ', '案件・相談内容を自由記入')}
            />
          </div>

          <div style={styles.fieldRow}>
            <span style={styles.label}>
              {T('添付（最大3枚・プレビューのみ）', '画像（最大3枚・プレビューのみ）')}
            </span>
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
                  {T('＋ 添付追加', '＋ 画像を追加')}
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
              <span
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0,
                }}
              >
                <span style={styles.deliberating}>{T('審議中…', '実行中…')}</span>
                <span style={styles.loadingLineWrap}>
                  <span style={styles.loadingLine} />
                </span>
              </span>
            ) : (
              T('裁可（実行）', '実行')
            )}
          </button>
        </div>

        {result && (
          <div style={styles.card}>
            <div style={{ ...styles.label, marginBottom: 10 }}>
              {T('裁可', '結果')}
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={styles.badge}>{result.category}</span>
              <strong>{result.title}</strong>
              <span style={{ ...styles.meta, marginLeft: 8 }}>{result.timestamp}</span>
            </div>
            <div style={{ ...styles.resultBlock, marginBottom: 10 }}>
              <div style={styles.resultLabel}>{T('御見立', '判断')}</div>
              {(() => {
                const j = String(result.judgment || '').toUpperCase()
                const isOK = j === 'OK'
                const isNG = j === 'NG'
                const label = isOK
                  ? T('可', 'OK')
                  : isNG
                    ? T('不可', 'NG')
                    : result.judgment
                const fg = isOK ? '#34d399' : isNG ? '#f87171' : '#e8e8e8'
                return (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 18px',
                      borderRadius: 6,
                      background: genroinMode ? '#0a0a0a' : '#ffffff',
                      border: '1px solid ' + (genroinMode ? '#d4a017' : '#d1d5db'),
                      color: fg,
                      fontWeight: 700,
                      fontSize: 16,
                      letterSpacing: genroinMode ? 4 : 1,
                      boxShadow: genroinMode
                        ? '0 0 12px rgba(212,160,23,0.2)'
                        : 'none',
                    }}
                  >
                    {label}
                  </span>
                )
              })()}
            </div>
            <div style={{ ...styles.resultBlock, marginBottom: 10 }}>
              <div style={styles.resultLabel}>{T('御沙汰', '結論')}</div>
              {result.conclusion}
            </div>
            <div style={styles.resultBlock}>
              <div style={styles.resultLabel}>{T('仰せの理', '理由')}</div>
              {result.reason}
            </div>
            <div style={styles.quickRow}>
              <button
                type="button"
                style={styles.quickBtnImportant}
                onClick={() => applyQuickAction(result.id, 'important')}
              >
                {T('★ 勅令認定', '★ 重要にする')}
              </button>
              <button
                type="button"
                style={styles.quickBtnDiscard}
                onClick={() => applyQuickAction(result.id, 'discard')}
              >
                {T('却下', '破棄')}
              </button>
              <button
                type="button"
                style={styles.quickBtnHold}
                onClick={() => applyQuickAction(result.id, 'hold')}
              >
                {T('持ち越し', '保留')}
              </button>
            </div>
          </div>
        )}

        <div style={styles.card}>
          <div style={{ ...styles.label, marginBottom: 6 }}>
            {T('議事録', '履歴')}（最新{Math.min(history.length, 50)}件 / 最大50）
          </div>
          {history.length === 0 ? (
            <div style={styles.emptyHistory}>
              {T('議事録なし', 'まだ履歴はありません')}
            </div>
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
                        {T('★勅令', '★重要')}
                      </span>
                    )}
                    <span style={{ ...styles.meta, marginLeft: 8 }}>
                      {h.timestamp}
                    </span>
                    {h.image_count > 0 && (
                      <span style={{ ...styles.meta, marginLeft: 8 }}>
                        {T('添付', '画像')}{h.image_count}枚
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
                      {T('勅令', '重要')}
                    </label>
                    <label style={styles.flagLabel}>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => toggleFlag(h.id, 'isActive')}
                        disabled={!h.id}
                      />
                      {T('議題対象', '検索対象')}
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
                <span style={styles.label}>{T('上奏文', '内容')}</span>
                <textarea
                  style={styles.textarea}
                  value={smokingForm.content}
                  onChange={(e) =>
                    setSmokingForm({ ...smokingForm, content: e.target.value })
                  }
                  placeholder={T(
                    '思案・課題・献策を自由に上奏せよ',
                    '思いついたこと・課題・アイデアを自由に投稿',
                  )}
                />
              </div>
              <div style={styles.fieldRow}>
                <span style={styles.label}>
                  {T('印（カンマ区切り任意）', 'タグ（カンマ区切り任意）')}
                </span>
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
                <span style={styles.label}>{T('上奏者', '投稿者')}</span>
                <input
                  type="text"
                  style={styles.input}
                  value={smokingForm.author}
                  onChange={(e) =>
                    setSmokingForm({ ...smokingForm, author: e.target.value })
                  }
                  placeholder={T('氏名', '名前')}
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
                    <span
                      style={{
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <span style={styles.deliberating}>
                        {T('奏上中…', '投稿中…')}
                      </span>
                      <span style={styles.loadingLineWrap}>
                        <span style={styles.loadingLine} />
                      </span>
                    </span>
                  ) : (
                    T('投稿（奏上）', '投稿')
                  )}
                </button>
                <button
                  type="button"
                  style={styles.secondaryBtn(smokingProcessing)}
                  disabled={smokingProcessing}
                  onClick={handleSmokingProcess}
                >
                  {smokingProcessing ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <span style={styles.deliberating}>
                        {T('議事中…', 'AI処理中…')}
                      </span>
                      <span style={styles.loadingLineWrap}>
                        <span style={styles.loadingLine} />
                      </span>
                    </span>
                  ) : (
                    T('AI処理（議事）', 'AI処理（未処理を一括構造化）')
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
                  {T('未処理上奏', '未処理一覧')}（{smokingList.length}）
                </div>
                <button
                  type="button"
                  style={styles.secondaryBtn(smokingListLoading)}
                  disabled={smokingListLoading}
                  onClick={loadSmokingList}
                >
                  {smokingListLoading
                    ? T('閲覧中…', '読込中…')
                    : T('再閲覧', '再読込')}
                </button>
              </div>
              {smokingList.length === 0 ? (
                <div style={styles.emptyHistory}>
                  {smokingListLoading
                    ? T('閲覧中…', '読込中…')
                    : T('未処理なし', '未処理はありません')}
                </div>
              ) : (
                smokingList.map((s, i) => {
                  const sid = s['喫煙所ID']
                  return (
                    <div
                      key={sid || i}
                      id={'item-' + sid}
                      className={targetId === sid ? 'highlight-target' : ''}
                      style={styles.smokingItem}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 4,
                        }}
                      >
                        <span style={styles.badge}>{sid}</span>
                        <span style={styles.meta}>{formatTimestamp(s['日時'])}</span>
                        {s['投稿者'] && (
                          <span style={{ ...styles.meta, marginLeft: 4 }}>
                            by {s['投稿者']}
                          </span>
                        )}
                        {s['タグ'] && (
                          <span style={{ ...styles.meta, marginLeft: 4 }}>
                            #{s['タグ']}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopyLink('smoking', sid)}
                          title="リンクコピー"
                          style={{
                            marginLeft: 'auto',
                            background: 'transparent',
                            border: 'none',
                            color: genroinMode ? '#d4a017' : '#6b7280',
                            cursor: 'pointer',
                            fontSize: 14,
                            padding: '2px 6px',
                          }}
                        >
                          🔗
                        </button>
                      </div>
                      <div style={{ color: genroinMode ? '#e8e8e8' : '#1a1a1a', marginTop: 2 }}>
                        {s['内容']}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}

        {activeTab === 'genroin' && (
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
                {T('議事一覧', '元老院一覧')}（{genroinList.length}）
              </div>
              <button
                type="button"
                style={styles.secondaryBtn(genroinLoading)}
                disabled={genroinLoading}
                onClick={loadGenroinList}
              >
                {genroinLoading
                  ? T('閲覧中…', '読込中…')
                  : T('再閲覧', '再読込')}
              </button>
            </div>
            {genroinList.length === 0 ? (
              <div style={styles.emptyHistory}>
                {genroinLoading
                  ? T('閲覧中…', '読込中…')
                  : T('議題なし', '元老院エントリなし')}
              </div>
            ) : (
              genroinList.map((g, i) => {
                const id = g['元老院ID']
                const adoption = g['採用可否'] || ''
                const memo = genroinMemoEdits[id] !== undefined
                  ? genroinMemoEdits[id]
                  : (g['メモ'] || '')
                const memoChanged = genroinMemoEdits[id] !== undefined &&
                  genroinMemoEdits[id] !== (g['メモ'] || '')
                const busy = genroinBusyId === id
                return (
                  <div
                    key={id || i}
                    id={'item-' + id}
                    className={targetId === id ? 'highlight-target' : ''}
                    style={{
                      borderTop: '1px solid ' + (genroinMode ? '#2a2418' : '#f0f0f0'),
                      padding: '14px 4px',
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 6,
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 4,
                      }}
                    >
                      <span style={styles.badge}>{id}</span>
                      <strong style={{ color: genroinMode ? '#e8e8e8' : '#1a1a1a' }}>
                        {g['タイトル']}
                      </strong>
                      <span style={{ ...styles.badge, marginLeft: 4 }}>
                        {g['カテゴリ']}
                      </span>
                      <span style={priorityBadgeStyle(g['優先度'], genroinMode)}>
                        優{g['優先度']}
                      </span>
                      {adoption && (
                        <span style={adoptionBadgeStyle(adoption, genroinMode)}>
                          {adoption === 'Yes' ? '採用' : '不採用'}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyLink('genroin', id)}
                        title="リンクコピー"
                        style={{
                          marginLeft: 'auto',
                          background: 'transparent',
                          border: 'none',
                          color: genroinMode ? '#d4a017' : '#6b7280',
                          cursor: 'pointer',
                          fontSize: 14,
                          padding: '2px 6px',
                        }}
                      >
                        🔗
                      </button>
                    </div>
                    <div
                      style={{
                        color: genroinMode ? '#cbd5e1' : '#555',
                        marginBottom: 8,
                        fontSize: 13,
                      }}
                    >
                      {g['要約']}
                    </div>

                    {(() => {
                      const review = g['AI審議コメント']
                      const reviewBusy = aiReviewBusyId === id
                      const boxStyle = {
                        marginBottom: 10,
                        padding: 10,
                        borderRadius: 6,
                        background: genroinMode
                          ? 'rgba(0,0,0,0.4)'
                          : '#fafafa',
                        border:
                          '1px solid ' +
                          (genroinMode ? 'rgba(251,191,36,0.45)' : '#e5e7eb'),
                        fontSize: 12,
                        color: genroinMode ? '#fef3c7' : '#374151',
                      }
                      if (review) {
                        return (
                          <div style={boxStyle}>
                            <pre
                              style={{
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'inherit',
                                fontSize: 12,
                                lineHeight: 1.6,
                              }}
                            >
                              {review}
                            </pre>
                            <div style={{ ...styles.rowActions, marginTop: 6 }}>
                              <button
                                type="button"
                                style={styles.secondaryBtn(reviewBusy)}
                                disabled={reviewBusy}
                                onClick={() => handleAiReview(id)}
                              >
                                {reviewBusy ? (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <span style={styles.deliberating}>
                                      {T('御再審議中…', '審議中…')}
                                    </span>
                                    <span style={styles.loadingLineWrap}>
                                      <span style={styles.loadingLine} />
                                    </span>
                                  </span>
                                ) : (
                                  T('再御審議', '再審議')
                                )}
                              </button>
                            </div>
                          </div>
                        )
                      }
                      return (
                        <div style={{ marginBottom: 10 }}>
                          <button
                            type="button"
                            style={styles.secondaryBtn(reviewBusy)}
                            disabled={reviewBusy}
                            onClick={() => handleAiReview(id)}
                          >
                            {reviewBusy ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                }}
                              >
                                <span style={styles.deliberating}>
                                  {T('御審議中…', '審議中…')}
                                </span>
                                <span style={styles.loadingLineWrap}>
                                  <span style={styles.loadingLine} />
                                </span>
                              </span>
                            ) : (
                              '🤖 ' + T('御審議', 'AI審議')
                            )}
                          </button>
                        </div>
                      )
                    })()}

                    <div style={styles.flagRow}>
                      <label style={styles.flagLabel}>
                        <input
                          type="radio"
                          name={'adoption-' + id}
                          checked={adoption === 'Yes'}
                          disabled={busy}
                          onChange={() => handleAdoption(id, 'Yes')}
                        />
                        採用（Yes）
                      </label>
                      <label style={styles.flagLabel}>
                        <input
                          type="radio"
                          name={'adoption-' + id}
                          checked={adoption === 'No'}
                          disabled={busy}
                          onChange={() => handleAdoption(id, 'No')}
                        />
                        不採用（No）
                      </label>
                      <label style={styles.flagLabel}>
                        <input
                          type="radio"
                          name={'adoption-' + id}
                          checked={!adoption}
                          disabled={busy}
                          onChange={() => handleAdoption(id, '')}
                        />
                        未決
                      </label>
                    </div>

                    <textarea
                      style={{ ...styles.textarea, minHeight: 60, marginTop: 8 }}
                      value={memo}
                      onChange={(e) =>
                        setGenroinMemoEdits({
                          ...genroinMemoEdits,
                          [id]: e.target.value,
                        })
                      }
                      placeholder={T('御記録（補足メモ）', 'メモ（補足）')}
                    />
                    <div style={styles.rowActions}>
                      <button
                        type="button"
                        style={styles.secondaryBtn(!memoChanged || busy)}
                        disabled={!memoChanged || busy}
                        onClick={() => handleSaveMemo(id)}
                      >
                        {T('御記録 保存', 'メモ 保存')}
                      </button>
                      <button
                        type="button"
                        style={styles.primaryBtn(adoption !== 'Yes' || busy)}
                        disabled={adoption !== 'Yes' || busy}
                        onClick={() => handleCreateTask(id)}
                      >
                        {T('勅命に下す', '案件化')}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'task' && (
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
                {T('勅命一覧', '案件一覧')}（{taskList.length}）
              </div>
              <button
                type="button"
                style={styles.secondaryBtn(taskLoading)}
                disabled={taskLoading}
                onClick={loadTaskList}
              >
                {taskLoading ? T('閲覧中…', '読込中…') : T('再閲覧', '再読込')}
              </button>
            </div>
            {taskList.length === 0 ? (
              <div style={styles.emptyHistory}>
                {taskLoading
                  ? T('閲覧中…', '読込中…')
                  : T('勅命なし', '案件なし')}
              </div>
            ) : (
              taskList.map((t, i) => {
                const id = t['案件ID']
                const status = t['ステータス'] || '未着手'
                const isOpen = logOpenId === id
                return (
                  <div
                    key={id || i}
                    id={'item-' + id}
                    className={targetId === id ? 'highlight-target' : ''}
                    style={{
                      borderTop: '1px solid ' + (genroinMode ? '#2a2418' : '#f0f0f0'),
                      padding: '14px 4px',
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 4,
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 4,
                      }}
                    >
                      <span style={styles.badge}>{id}</span>
                      <strong style={{ color: genroinMode ? '#e8e8e8' : '#1a1a1a' }}>
                        {t['タイトル']}
                      </strong>
                      <span style={statusBadgeStyle(status, genroinMode)}>{status}</span>
                      {t['カテゴリ'] && (
                        <span style={{ ...styles.badge, marginLeft: 4 }}>
                          {t['カテゴリ']}
                        </span>
                      )}
                      {t['優先度'] && (
                        <span style={priorityBadgeStyle(t['優先度'], genroinMode)}>
                          優{t['優先度']}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyLink('task', id)}
                        title="リンクコピー"
                        style={{
                          marginLeft: 'auto',
                          background: 'transparent',
                          border: 'none',
                          color: genroinMode ? '#d4a017' : '#6b7280',
                          cursor: 'pointer',
                          fontSize: 14,
                          padding: '2px 6px',
                        }}
                      >
                        🔗
                      </button>
                    </div>
                    <div style={{ color: genroinMode ? '#9ca3af' : '#666', fontSize: 12 }}>
                      {t['担当者'] && '担当: ' + t['担当者']}
                      {t['期限'] && (
                        <span style={{ marginLeft: 12 }}>
                          期限: {formatTimestamp(t['期限'])}
                        </span>
                      )}
                      {t['元老院ID'] && (
                        <span style={{ marginLeft: 12 }}>← {t['元老院ID']}</span>
                      )}
                    </div>
                    <div style={styles.rowActions}>
                      <button
                        type="button"
                        style={styles.secondaryBtn(false)}
                        onClick={() => openLogForm(id)}
                      >
                        {isOpen
                          ? T('実行録 閉じる', '実行ログ 閉じる')
                          : T('実行録 追加', '実行ログ 追加')}
                      </button>
                    </div>
                    {isOpen && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: 12,
                          background: genroinMode ? '#0d0d0d' : '#fafafa',
                          border: '1px solid ' + (genroinMode ? '#3a2f15' : '#e5e7eb'),
                          borderRadius: 8,
                        }}
                      >
                        <div style={styles.fieldRow}>
                          <span style={styles.label}>結果（必須）</span>
                          <input
                            type="text"
                            style={styles.input}
                            value={logForm.result}
                            onChange={(e) =>
                              setLogForm({ ...logForm, result: e.target.value })
                            }
                            placeholder="実行結果の概要"
                          />
                        </div>
                        <div style={styles.fieldRow}>
                          <span style={styles.label}>成功/失敗</span>
                          <div style={styles.flagRow}>
                            {['成功', '失敗', '部分'].map((v) => (
                              <label key={v} style={styles.flagLabel}>
                                <input
                                  type="radio"
                                  name={'success-' + id}
                                  checked={logForm.success === v}
                                  onChange={() =>
                                    setLogForm({ ...logForm, success: v })
                                  }
                                />
                                {v}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div style={styles.fieldRow}>
                          <span style={styles.label}>学び</span>
                          <textarea
                            style={{ ...styles.textarea, minHeight: 60 }}
                            value={logForm.learning}
                            onChange={(e) =>
                              setLogForm({ ...logForm, learning: e.target.value })
                            }
                            placeholder="教訓・改善点"
                          />
                        </div>
                        <div style={styles.rowActions}>
                          <button
                            type="button"
                            style={styles.primaryBtn(
                              !logForm.result.trim() || logBusy,
                            )}
                            disabled={!logForm.result.trim() || logBusy}
                            onClick={() => handleAddLog(id)}
                          >
                            {logBusy ? (
                              <span style={styles.deliberating}>
                                {T('記帳中…', '記録中…')}
                              </span>
                            ) : (
                              T('実行録 記帳', '実行ログ 記録')
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
        </main>

        <aside className={'side right ' + (genroinMode ? 'on' : 'off')}>
          {genroinMode ? (
            <RightPanelGenroin
              recent={sideRecent}
              summary={sideSummary}
              suggestion={aiSuggestion}
              fallback={localFallbackSuggestion}
              loading={aiLoading}
              error={aiError}
              onRefresh={loadAiSuggestion}
              actionables={aiActionables}
              busyId={oneClickBusyId}
              onOneClick={handleOneClick}
              backupProps={{
                backups,
                loading: backupsLoading,
                busy: backupBusy,
                restoreBusy,
                onLoad: loadBackups,
                onCreate: createBackup,
                onRestore: restoreBackup,
              }}
            />
          ) : (
            <RightPanelNormal
              history={history}
              backupProps={{
                backups,
                loading: backupsLoading,
                busy: backupBusy,
                restoreBusy,
                onLoad: loadBackups,
                onCreate: createBackup,
                onRestore: restoreBackup,
              }}
            />
          )}
        </aside>
      </div>
      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  )
}
