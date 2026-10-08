import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderKanban,
  Plus,
  Play,
  Layers,
  Edit3,
  Trash2,
  FolderPlus,
  AlertCircle,
  GraduationCap,
  ArrowRight
} from 'lucide-react'
import { Button } from '../components/Button'
import { WordSetForm } from '../components/WordSetForm'
import { createWordSet, deleteWordSet, listWordSets, updateWordSet } from '../services/wordSetApi'
import type { WordSet } from '../types'

export function WordSetsPage() {
  const [wordSets, setWordSets] = useState<WordSet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  function loadWordSets() {
    setIsLoading(true)
    setError('')
    void listWordSets()
      .then(setWordSets)
      .catch((loadError: unknown) =>
        setError(loadError instanceof Error ? loadError.message : 'Không tải được bộ từ.')
      )
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    void listWordSets()
      .then((result) => {
        setWordSets(result)
        setError('')
      })
      .catch((loadError: unknown) =>
        setError(loadError instanceof Error ? loadError.message : 'Không tải được bộ từ.')
      )
      .finally(() => setIsLoading(false))
  }, [])

  async function handleCreate(name: string, description: string) {
    const wordSet = await createWordSet(name, description)
    setWordSets((current) => [wordSet, ...current])
    setError('')
    setIsCreating(false)
  }

  async function handleUpdate(id: string, name: string, description: string) {
    const wordSet = await updateWordSet(id, { name, description })
    setWordSets((current) => current.map((item) => (item.id === id ? wordSet : item)))
    setError('')
    setEditingId(null)
  }

  async function handleDelete(wordSet: WordSet) {
    if (!window.confirm(`Bạn có chắc chắn muốn xoá bộ từ “${wordSet.name}”? Thao tác này không thể hoàn tác.`)) {
      return
    }
    await deleteWordSet(wordSet.id)
    setWordSets((current) => current.filter((item) => item.id !== wordSet.id))
  }

  const totalFlashcards = wordSets.reduce(
    (acc, set) => acc + (set._count?.flashcards ?? 0),
    0
  )

  return (
    <div className="page-content">
      <header className="section-heading">
        <div>
          <div className="eyebrow">
            <FolderKanban size={14} />
            <span>Thư viện cá nhân</span>
          </div>
          <h1>Bộ từ của tôi</h1>
          <p className="page-description">
            Quản lý các danh sách từ vựng theo chủ đề và luyện tập flashcard hàng ngày.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={() => setIsCreating((current) => !current)}
        >
          <Plus size={16} />
          <span>{isCreating ? 'Đóng form tạo' : 'Tạo bộ từ mới'}</span>
        </Button>
      </header>

      {/* Stats Overview */}
      {!isLoading && !error && wordSets.length > 0 ? (
        <div className="word-set-stats-row">
          <div className="stat-card">
            <div className="stat-icon bg-indigo-50 text-indigo-600">
              <FolderKanban size={22} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">{wordSets.length}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số bộ từ</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-purple-50 text-purple-600">
              <Layers size={22} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">{totalFlashcards}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số flashcard</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-emerald-50 text-emerald-600">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">Sẵn sàng</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Luyện tập thông minh</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Create form */}
      {isCreating ? (
        <section className="content-card mb-6 border-indigo-200 bg-indigo-50/20 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 grid place-items-center">
              <FolderPlus size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 m-0">Tạo bộ từ mới</h2>
          </div>
          <WordSetForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
        </section>
      ) : null}

      {error ? (
        <div className="error-state" role="alert">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <strong>Không tải được bộ từ</strong>
            <span>{error}</span>
            <button
              className="text-link mt-2 inline-flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900"
              type="button"
              onClick={() => {
                setError('')
                loadWordSets()
              }}
            >
              <span>Thử lại</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="content-card loading-card">
              <div className="skeleton-line skeleton-wide" />
              <div className="skeleton-line skeleton-medium" />
              <div className="skeleton-line skeleton-short" />
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && !error && wordSets.length === 0 ? (
        <div className="content-card empty-line flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center mb-4">
            <FolderPlus size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Chưa có bộ từ nào</h2>
          <p className="text-slate-500 max-w-md text-center mb-6 text-sm leading-relaxed">
            Tạo bộ từ đầu tiên để bắt đầu lưu từ vựng trong quá trình tra cứu và luyện tập flashcard ghi nhớ.
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsCreating(true)}
          >
            <Plus size={16} />
            <span>Tạo bộ từ đầu tiên ngay</span>
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && wordSets.length > 0 ? (
        <div className="word-set-grid">
          {wordSets.map((wordSet) =>
            editingId === wordSet.id ? (
              <section className="content-card border-indigo-200" key={wordSet.id}>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Chỉnh sửa bộ từ</h2>
                <WordSetForm
                  initialValue={wordSet}
                  onSubmit={(name, description) => handleUpdate(wordSet.id, name, description)}
                  onCancel={() => setEditingId(null)}
                />
              </section>
            ) : (
              <article className="word-set-card" key={wordSet.id}>
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0">
                      <FolderKanban size={20} />
                    </div>
                    <span className="word-set-count">
                      <Layers size={13} />
                      <span>{wordSet._count?.flashcards ?? 0} từ</span>
                    </span>
                  </div>

                  <h2>{wordSet.name}</h2>
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                    {wordSet.description || 'Chưa có mô tả cho bộ từ này'}
                  </p>
                </div>

                <div className="card-actions">
                  <div className="flex items-center gap-2">
                    <Link
                      className="button button-primary !min-h-[36px] !py-1.5 !px-3 !text-xs"
                      to={`/word-sets/${wordSet.id}/study`}
                      title="Bắt đầu ôn tập bộ từ này"
                    >
                      <Play size={13} fill="currentColor" />
                      <span>Học ngay</span>
                    </Link>
                    <Link
                      className="button button-outline !min-h-[36px] !py-1.5 !px-3 !text-xs"
                      to={`/word-sets/${wordSet.id}`}
                    >
                      <span>Chi tiết</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      className="button button-ghost !min-h-[32px] !w-8 !p-0"
                      type="button"
                      title="Chỉnh sửa bộ từ"
                      onClick={() => setEditingId(wordSet.id)}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      className="button button-ghost danger-action !min-h-[32px] !w-8 !p-0"
                      type="button"
                      title="Xoá bộ từ"
                      onClick={() => void handleDelete(wordSet)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      ) : null}
    </div>
  )
}
