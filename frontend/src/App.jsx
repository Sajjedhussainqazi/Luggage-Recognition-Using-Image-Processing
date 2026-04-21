import { useState } from "react"
import Navbar from "./components/Navbar"
import UploadPage from "./pages/UploadPage"
import LivePage from "./pages/LivePage"

export default function App() {
  const [activePage, setActivePage] = useState("upload")

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main style={{ padding: '0 24px' }}>
        {activePage === "upload" ? <UploadPage /> : <LivePage />}
      </main>
    </div>
  )
}