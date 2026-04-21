const LABEL_COLORS = {
  suitcase: { bg: 'rgba(0,102,255,0.15)', border: 'rgba(0,102,255,0.4)', text: '#4D9FFF' },
  backpack: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', text: '#A78BFA' },
  handbag:  { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)', text: '#F472B6' },
}

export default function ResultCard({ detections, summary, totalItems, showSimilarity }) {
  if (totalItems === 0) {
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 24,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>◌</div>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: '0.05em' }}>
          NO LUGGAGE DETECTED
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
          Try a clearer image with visible luggage
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,200,255,0.03)',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
        }}>
          Detection Results
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--accent)',
          background: 'rgba(0,200,255,0.1)',
          border: '1px solid rgba(0,200,255,0.25)',
          padding: '2px 10px',
          borderRadius: 4,
        }}>
          {totalItems} ITEM{totalItems !== 1 ? 'S' : ''}
        </span>
      </div>

      {/* Summary badges */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {Object.entries(summary).map(([label, count]) => {
          const c = LABEL_COLORS[label] || { bg: 'rgba(100,120,150,0.15)', border: 'rgba(100,120,150,0.3)', text: 'var(--text-secondary)' }
          return (
            <span key={label} style={{
              background: c.bg, border: `1px solid ${c.border}`, color: c.text,
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
              padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {label} ×{count}
            </span>
          )
        })}
      </div>

      {/* Detection list */}
      <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {detections.map((d, i) => {
          const c = LABEL_COLORS[d.label] || { bg: 'rgba(100,120,150,0.1)', border: 'rgba(100,120,150,0.2)', text: 'var(--text-secondary)' }
          return (
            <div key={i} style={{
              background: d.is_match ? 'rgba(255,59,92,0.08)' : 'var(--bg-surface2)',
              border: `1px solid ${d.is_match ? 'rgba(255,59,92,0.35)' : 'var(--border)'}`,
              borderRadius: 8,
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: d.is_match ? 'var(--danger)' : c.text,
                  boxShadow: d.is_match ? '0 0 8px var(--danger)' : 'none',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 14, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  color: d.is_match ? '#FF7A93' : 'var(--text-primary)',
                }}>
                  {d.label}
                </span>
                {d.is_match && (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    background: 'var(--danger)', color: '#fff',
                    padding: '1px 6px', borderRadius: 3, letterSpacing: '0.08em',
                  }}>
                    MATCH
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {showSimilarity && (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: d.is_match ? 'var(--danger)' : 'var(--text-muted)',
                  }}>
                    {d.similarity}% sim
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 80, height: 3, background: 'var(--bg-surface3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      width: `${d.confidence}%`, height: '100%',
                      background: d.is_match
                        ? 'linear-gradient(90deg, #FF3B5C, #FF7A93)'
                        : 'linear-gradient(90deg, var(--accent-dim), var(--accent))',
                      borderRadius: 2,
                    }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', minWidth: 44, textAlign: 'right' }}>
                    {d.confidence}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}