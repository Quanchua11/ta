import { NavLink, Outlet } from 'react-router-dom'
import { Search, FolderKanban, Sparkles } from 'lucide-react'

export function AppLayout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <NavLink className="brand" to="/" title="HocTA - Trang chủ">
          <div className="brand-icon-box">
            <Sparkles size={18} strokeWidth={2.5} />
          </div>
          <span className="brand-text">HocTA</span>
        </NavLink>
        <nav className="app-nav" aria-label="Điều hướng chính">
          <NavLink end className={({ isActive }) => (isActive ? 'active' : undefined)} to="/">
            <Search size={16} />
            <span>Tìm từ</span>
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? 'active' : undefined)} to="/word-sets">
            <FolderKanban size={16} />
            <span>Bộ từ của tôi</span>
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
