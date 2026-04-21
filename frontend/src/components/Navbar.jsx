export default function Navbar({ activePage, setActivePage }) {
  return (
    <nav style={{
      background: 'linear-gradient(180deg, #0C1929 0%, #091522 100%)',
      borderBottom: '1px solid #1A3355',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            background: 'rgba(0,200,255,0.08)',
            border: '1px solid rgba(0,200,255,0.3)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            🧳
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}>
              LUGGAGE<span style={{ color: 'var(--accent)' }}>TRACK</span>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--text-muted)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              AI Vision System v2.0
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
          {[
            { id: 'upload', icon: '⬆', label: 'Upload & Scan' },
            { id: 'live',   icon: '◉', label: 'Live Detection' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePage(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
                background: activePage === tab.id
                  ? 'rgba(0,200,255,0.12)'
                  : 'transparent',
                color: activePage === tab.id
                  ? 'var(--accent)'
                  : 'var(--text-secondary)',
                boxShadow: activePage === tab.id
                  ? 'inset 0 0 0 1px rgba(0,200,255,0.3)'
                  : 'none',
              }}
            >
              <span style={{ fontSize: 11 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--success)',
            boxShadow: '0 0 8px var(--success)',
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
            SYSTEM ONLINE
          </span>
        </div>
      </div>
    </nav>
  )
}