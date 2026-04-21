import { useRef, useState, useEffect, useCallback } from "react"
import ResultCard from "../components/ResultCard"

const WS_URL = "ws://127.0.0.1:8000/ws/detect"

const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em',
    textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 8,
  }}>
    <div style={{ width: 16, height: 1, background: 'var(--accent)' }} />
    {children}
    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
  </div>
)

export default function LivePage() {
  const videoRef    = useRef()
  const canvasRef   = useRef()
  const wsRef       = useRef()
  const intervalRef = useRef()

  const [active, setActive]     = useState(false)
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState(null)
  const [fps, setFps]           = useState(0)
  const [log, setLog]           = useState([])
  const [alerting, setAlerting] = useState(false)
  const fpsRef   = useRef(0)
  const alertRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setFps(fpsRef.current)
      fpsRef.current = 0
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (result?.match_found) {
      setAlerting(true)
      clearTimeout(alertRef.current)
      alertRef.current = setTimeout(() => setAlerting(false), 4000)
      const now = new Date().toLocaleTimeString()
      setLog(prev => [
        { time: now, camera: result.camera_id, score: result.best_match_score },
        ...prev.slice(0, 9)
      ])
    }
  }, [result?.match_found, result?.best_match_score])

  const startDetection = useCallback(async () => {
    setError(null)
    setLog([])
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true })
    } catch {
      setError("Camera access denied or not available.")
      return
    }
    videoRef.current.srcObject = stream
    await videoRef.current.play()
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws
    ws.onopen = () => {
      setActive(true)
      intervalRef.current = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return
        const canvas = canvasRef.current
        const video  = videoRef.current
        if (!canvas || !video) return
        canvas.width  = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext("2d").drawImage(video, 0, 0)
        const frame = canvas.toDataURL("image/jpeg", 0.7)
        ws.send(JSON.stringify({ frame, camera_id: "CAM-01" }))
      }, 150)
    }
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setResult(data)
      fpsRef.current += 1
    }
    ws.onerror = () => setError("WebSocket error. Is the backend running?")
    ws.onclose = () => setActive(false)
  }, [])

  const stopDetection = useCallback(() => {
    clearInterval(intervalRef.current)
    wsRef.current?.close()
    const stream = videoRef.current?.srcObject
    stream?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setActive(false)
    setResult(null)
    setAlerting(false)
  }, [])

  useEffect(() => () => stopDetection(), [])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <SectionLabel>Live CCTV Detection</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-primary)', lineHeight: 1.1, margin: 0 }}>
              Live Monitor
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
              System scans every frame and alerts instantly when your bag is found
            </p>
          </div>
          {active && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              padding: '8px 16px', borderRadius: 8,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
                {fps} FPS
              </span>
              <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.08em' }}>
                CAM-01
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      {!active && (
        <div style={{
          background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.2)',
          borderRadius: 10, padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.04em', lineHeight: 1.6 }}>
            Upload your lost bag photo in the <strong style={{ color: 'var(--accent)' }}>Upload & Scan</strong> tab (Step 01) first. Then start detection — the system scans every frame automatically.
          </span>
        </div>
      )}

      {/* Reference status */}
      {active && result && (
        <div style={{
          background: result.reference_active ? 'var(--success-dim)' : 'rgba(255,184,0,0.06)',
          border: `1px solid ${result.reference_active ? 'rgba(0,232,122,0.25)' : 'rgba(255,184,0,0.2)'}`,
          borderRadius: 10, padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: result.reference_active ? 'var(--success)' : 'var(--warning)',
            boxShadow: result.reference_active ? '0 0 8px var(--success)' : '0 0 8px var(--warning)',
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: result.reference_active ? 'var(--success)' : 'var(--warning)', letterSpacing: '0.06em' }}>
            {result.reference_active
              ? `REFERENCE ACTIVE — Scanning ${result.total_items} item(s) per frame`
              : 'NO REFERENCE — Go to Upload & Scan tab and register your bag first'}
          </span>
        </div>
      )}

      {/* ALERT */}
      {alerting && (
        <div style={{
          background: 'var(--danger-dim)', border: '2px solid var(--danger)',
          borderRadius: 12, padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: '0 0 40px rgba(255,59,92,0.25)',
          animation: 'fadeSlideUp 0.3s ease',
        }}>
          <div style={{ fontSize: 40, animation: 'blink 0.8s ease-in-out infinite' }}>🚨</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--danger)', letterSpacing: '0.06em' }}>
              TARGET LUGGAGE LOCATED
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
              {[
                ['CONFIDENCE', `${result?.best_match_score}%`],
                ['CAMERA', result?.camera_id],
                ['TIME', new Date().toLocaleTimeString()],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>{k}:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Camera feed */}
      <div style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${active ? 'var(--border-bright)' : 'var(--border)'}`,
        borderRadius: 12, overflow: 'hidden',
        transition: 'border-color 0.3s',
        boxShadow: active ? '0 0 0 1px rgba(0,200,255,0.1)' : 'none',
      }}>
        <div style={{
          padding: '12px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Camera Feed
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', background: 'rgba(0,200,255,0.08)', padding: '2px 8px', borderRadius: 3 }}>
              CAM-01 / TERMINAL-A
            </span>
          </div>
          {active && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 8px var(--danger)', animation: 'blink 1.2s infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--danger)', letterSpacing: '0.12em' }}>LIVE</span>
            </div>
          )}
        </div>

        <div style={{ background: '#030810', minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <video ref={videoRef} style={{ width: '100%', maxHeight: 380, objectFit: 'contain', display: active ? 'block' : 'none' }} muted playsInline />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {!active && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>◉</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', margin: 0 }}>
                CAMERA OFFLINE
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 6, letterSpacing: '0.06em' }}>
                Press start to activate live detection
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12 }}>
        {!active ? (
          <button onClick={startDetection} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(0,200,255,0.1)', border: '1px solid rgba(0,200,255,0.35)',
            color: 'var(--accent)', padding: '12px 28px', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,200,255,0.18)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,200,255,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,200,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}>
            <span>▶</span> Activate Detection
          </button>
        ) : (
          <button onClick={stopDetection} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--danger-dim)', border: '1px solid rgba(255,59,92,0.35)',
            color: 'var(--danger)', padding: '12px 28px', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}>
            <span>■</span> Stop Detection
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(255,59,92,0.3)', borderRadius: 10, padding: '14px 18px', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          ✗ {error}
        </div>
      )}

      {/* Debug bar */}
      {active && result && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '8px 16px',
          display: 'flex', gap: 24, flexWrap: 'wrap',
        }}>
          {[
            ['Ref Active', result.reference_active, result.reference_active ? 'var(--success)' : 'var(--danger)'],
            ['Match', result.match_found, result.match_found ? 'var(--success)' : 'var(--text-muted)'],
            ['Best Score', `${result.best_match_score}%`, 'var(--accent)'],
            ['Items', result.total_items, 'var(--text-secondary)'],
          ].map(([k, v, color]) => (
            <div key={k} style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color, fontWeight: 500 }}>{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Results + Log */}
      {active && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {result && (
            <ResultCard
              detections={result.detections}
              summary={result.summary}
              totalItems={result.total_items}
              showSimilarity={result.reference_active}
            />
          )}

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Match Log
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                {log.length} EVENT{log.length !== 1 ? 'S' : ''}
              </span>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
              {log.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', margin: 0 }}>
                    AWAITING DETECTION EVENT
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--border-bright)', marginTop: 4, letterSpacing: '0.06em' }}>
                    System scanning every frame...
                  </p>
                </div>
              ) : log.map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(255,59,92,0.06)', border: '1px solid rgba(255,59,92,0.2)',
                  borderRadius: 7, padding: '8px 14px',
                  animation: i === 0 ? 'fadeSlideUp 0.3s ease' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 6px var(--danger)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)', fontWeight: 500 }}>{entry.camera}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)', fontWeight: 500 }}>{entry.score}%</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{entry.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}