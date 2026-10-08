import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { SearchPage } from './pages/SearchPage'
import { StudyPage } from './pages/StudyPage'
import { WordSetDetailPage } from './pages/WordSetDetailPage'
import { WordSetsPage } from './pages/WordSetsPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<SearchPage />} />
          <Route path="/word-sets" element={<WordSetsPage />} />
          <Route path="/word-sets/:id" element={<WordSetDetailPage />} />
          <Route path="/word-sets/:id/study" element={<StudyPage />} />
          <Route
            path="*"
            element={
              <div className="page-content text-center py-16">
                <div className="content-card max-w-md mx-auto flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center mb-4">
                    <span className="text-2xl font-bold">404</span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy trang</h1>
                  <p className="text-slate-500 text-sm mb-6">
                    Đường dẫn bạn yêu cầu không tồn tại hoặc đã được chuyển đi nơi khác.
                  </p>
                  <Link className="button button-primary" to="/">
                    Về trang tìm kiếm
                  </Link>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
