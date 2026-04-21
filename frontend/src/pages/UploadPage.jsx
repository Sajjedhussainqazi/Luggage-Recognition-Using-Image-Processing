import { useState, useRef } from "react"
import ResultCard from "../components/ResultCard"

const API_URL = "http://127.0.0.1:8000"

const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 8,
  }}>
    <div style={{ width: 16, height: 1, background: 'var(--accent)' }} />
    {children}
    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
  </div>
)

const StepBadge = ({ n, active }) => (
  <div style={{
    width: 24, height: 24, borderRadius: '50%',
    background: active ? 'rgba(0,200,255,0.15)' : 'var(--bg-surface3)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    flexShrink: 0,
  }}>
    {n}
  </div>
)

export default function UploadPage() {
  const [refImage, setRefImage]     = useState(null)
  const [refStatus, setRefStatus]   = useState(null)
  const [refLoading, setRefLoading] = useState(false)
  const [annotated, setAnnotated]   = useState(null)
  const [result, setResult]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [dragging, setDragging]     = useState(false)
  const refFileRef  = useRef()
  const scanFileRef = useRef()

  const uploadReference = async (file) => {
    if (!file) return
    setRefImage(URL.createObjectURL(file))
    setRefStatus(null)
    setRefLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res  = await fetch(`${API_URL}/reference/upload`, { method: "POST", body: formData })
      const data = await res.json()
      setRefStatus(data)
    } catch {
      setRefStatus({ error: "Could not connect to backend." })
    } finally {
      setRefLoading(false)
    }
  }

  const clearReference = async () => {
    await fetch(`${API_URL}/reference/clear`, { method: "DELETE" })
    setRefImage(null)
    setRefStatus(null)
    setResult(null)
    setAnnotated(null)
  }

  const scanImage = async (file) => {
    if (!file) return
    setAnnotated(null)
    setResult(null)
    setError(null)
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res  = await fetch(`${API_URL}/detect/image`, { method: "POST", body: formData })
      const data = await res.json()
      if (data.error) setError(data.error)
      else {
        setResult(data)
        setAnnotated(`data:image/jpeg;base64,${data.annotated_image}`)
      }
    } catch {
      setError("Could not connect to backend. Is it running?")
    } finally {
      setLoading(false)
    }
  }

  const step2Active = !!(refStatus && !refStatus.error)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 0', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Page header */}
      <div>
        <SectionLabel>Lost Luggage Search</SectionLabel>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 36, fontWeight: 700,
          letterSpacing: '0.04em',
          color: 'var(--text-primary)',
          lineHeight: 1.1, margin: 0,
        }}>
          Register & Scan
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>
          Upload a photo of your lost bag, then scan images or switch to Live Detection
        </p>
      </div>

      {/* Step 1 */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(0,200,255,0.02)',
        }}>
          <StepBadge n="01" active={true} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              Register Lost Bag
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Upload reference photo for feature extraction
            </div>
          </div>
          {refStatus && !refStatus.error && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--success)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Registered
              </span>
            </div>
          )}
        </div>

        <div style={{ padding: 24 }}>
          {!refImage ? (
            <div
              onClick={() => refFileRef.current.click()}
              style={{
                border: `1px dashed ${dragging ? 'var(--accent)' : 'var(--border-bright)'}`,
                borderRadius: 10,
                padding: '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'var(--accent-glow)' : 'var(--bg-surface2)',
                transition: 'all 0.2s',
              }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); uploadReference(e.dataTransfer.files[0]) }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🧳</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '0.04em' }}>
                Drop your lost bag photo here
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>or click to browse — JPG, PNG supported</p>
              <input ref={refFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => uploadReference(e.target.files[0])} />
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img src={refImage} alt="Reference"
                  style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                {refStatus && !refStatus.error && (
                  <div style={{
                    position: 'absolute', inset: -1, borderRadius: 8,
                    boxShadow: '0 0 16px rgba(0,232,122,0.4)',
                    border: '1px solid var(--success)', pointerEvents: 'none',
                  }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                {refLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid var(--accent)', borderTopColor: 'transparent',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em' }}>
                      EXTRACTING FEATURES...
                    </span>
                  </div>
                )}
                {refStatus && !refLoading && (
                  <div style={{
                    background: refStatus.error ? 'var(--danger-dim)' : 'var(--success-dim)',
                    border: `1px solid ${refStatus.error ? 'rgba(255,59,92,0.3)' : 'rgba(0,232,122,0.3)'}`,
                    borderRadius: 8, padding: '10px 14px',
                  }}>
                    <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: refStatus.error ? 'var(--danger)' : 'var(--success)' }}>
                      {refStatus.error ? '✗ ' + refStatus.error : '✓ Bag Registered Successfully'}
                    </p>
                    {!refStatus.error && (
                      <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                        Type: {refStatus.detected_type?.toUpperCase()} · Confidence: {refStatus.confidence}%
                      </p>
                    )}
                  </div>
                )}
                <button onClick={clearReference} style={{
                  marginTop: 10, background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)',
                  letterSpacing: '0.06em', padding: 0,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--danger)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                  ✕ REMOVE REFERENCE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2 */}
      <div style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${step2Active ? 'var(--border-bright)' : 'var(--border)'}`,
        borderRadius: 12,
        overflow: 'hidden',
        opacity: step2Active ? 1 : 0.5,
        transition: 'all 0.3s',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(0,200,255,0.02)',
        }}>
          <StepBadge n="02" active={step2Active} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, letterSpacing: '0.05em', color: step2Active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              Scan Image
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {step2Active ? 'Upload a photo to search for your bag' : 'Complete step 01 first'}
            </div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div
            onClick={() => step2Active && scanFileRef.current.click()}
            style={{
              border: '1px dashed var(--border-bright)',
              borderRadius: 10,
              padding: '32px 24px',
              textAlign: 'center',
              cursor: step2Active ? 'pointer' : 'not-allowed',
              background: 'var(--bg-surface2)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text-primary)', margin: 0 }}>
              Upload CCTV / Camera Image
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>
              System will match against your registered bag
            </p>
            <input ref={scanFileRef} type="file" accept="image/*" style={{ display: 'none' }} disabled={!step2Active}
              onChange={(e) => scanImage(e.target.files[0])} />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px 0' }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
            SCANNING FOR MATCH...
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(255,59,92,0.3)', borderRadius: 10, padding: '14px 18px', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          ✗ {error}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeSlideUp 0.4s ease' }}>
          {result.match_found ? (
            <div style={{
              background: 'var(--success-dim)',
              border: '1px solid rgba(0,232,122,0.4)',
              borderRadius: 12, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <span style={{ fontSize: 36 }}>🎉</span>
              <div>
                <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--success)', letterSpacing: '0.04em' }}>
                  LUGGAGE LOCATED
                </p>
                <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                  Match confidence: {result.best_match_score}% · Location: {result.camera_id}
                </p>
              </div>
            </div>
          ) : result.reference_active && (
            <div style={{
              background: 'rgba(255,184,0,0.08)',
              border: '1px solid rgba(255,184,0,0.25)',
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 24 }}>🔍</span>
              <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--warning)', letterSpacing: '0.04em' }}>
                NO MATCH FOUND — Try another image or switch to Live Detection
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 12, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Annotated Output
              </div>
              <img src={annotated} alt="Result" style={{ width: '100%', objectFit: 'contain', maxHeight: 280 }} />
            </div>
            <ResultCard
              detections={result.detections}
              summary={result.summary}
              totalItems={result.total_items}
              showSimilarity={result.reference_active}
            />
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}