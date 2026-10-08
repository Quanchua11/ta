import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  Layers,
  Search,
  BookOpen,
  PlusCircle,
  AlertCircle,
  Quote
} from 'lucide-react'
import { getWordSet } from '../services/wordSetApi'
import type { WordSet } from '../types'

export function WordSetDetailPage() {
  const { id } = useParams()
  const [wordSet, setWordSet] = useState<WordSet | null>(null)
  const [error, setError] = useState('')
  const [filterQuery, setFilterQuery] = useState('')

  useEffect(() => {
    if (!id) return
    void getWordSet(id)
      .then(setWordSet)
      .catch((loadError: unknown) =>
        setError(loadError instanceof Error ? loadError.message : 'Không tải được bộ từ.')
      )
  }, [id])

  const filteredCards = (wordSet?.flashcards ?? []).filter((card) => {
    if (!filterQuery.trim()) return true
    const q = filterQuery.toLowerCase()
    const matchWord = card.word.word.toLowerCase().includes(q)
    const matchMeaning = card.word.definitions?.some((def) =>
      def.vietnameseMeaning.toLowerCase().includes(q)
    )
    return matchWord || matchMeaning
  })

  return (
    <div className="page-content">
      <Link className="back-link" to="/word-sets">
        <ArrowLeft size={16} />
        <span>Quay lại Bộ từ của tôi</span>
      </Link>

      {error ? (
        <div className="error-state" role="alert">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <strong>Không tải được bộ từ</strong>
            <span>{error}</span>
          </div>
        </div>
      ) : null}

      {!error && !wordSet ? (
        <div className="content-card loading-card">
          <div className="skeleton-line skeleton-wide" />
          <div className="skeleton-line skeleton-medium" />
          <div className="skeleton-line skeleton-short" />
        </div>
      ) : null}

      {wordSet ? (
        <>
          <header className="section-heading">
            <div>
              <div className="eyebrow">
                <Layers size={14} />
                <span>Chi tiết bộ từ</span>
              </div>
              <h1>{wordSet.name}</h1>
              <p className="page-description">
                {wordSet.description || 'Chưa có mô tả cho bộ từ này'}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="word-set-count">
                  <Layers size={13} />
                  <span>{wordSet.flashcards?.length ?? 0} flashcard</span>
                </span>
              </div>
            </div>

            {wordSet.flashcards && wordSet.flashcards.length > 0 ? (
              <Link
                className="button button-primary"
                to={`/word-sets/${wordSet.id}/study`}
              >
                <Play size={16} fill="currentColor" />
                <span>Bắt đầu học</span>
              </Link>
            ) : null}
          </header>

          <section className="content-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800 m-0">
                  Danh sách flashcard
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  {filteredCards.length}
                </span>
              </div>

              {wordSet.flashcards && wordSet.flashcards.length > 3 ? (
                <div className="relative min-w-[220px]">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Tìm kiếm trong bộ..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ) : null}
            </div>

            {wordSet.flashcards?.length ? (
              filteredCards.length > 0 ? (
                <ul className="flashcard-list">
                  {filteredCards.map((flashcard) => (
                    <li key={flashcard.id} className="flashcard-item">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2.5">
                          <strong>{flashcard.word.word}</strong>
                          {flashcard.word.phonetic ? (
                            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {flashcard.word.phonetic}
                            </span>
                          ) : null}
                        </div>
                        <span>
                          {flashcard.word.definitions
                            ?.map((definition) => definition.vietnameseMeaning)
                            .join(', ') || 'Chưa có nghĩa tiếng Việt'}
                        </span>
                        {flashcard.word.definitions?.[0]?.englishExample ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 italic mt-1">
                            <Quote size={12} className="text-indigo-400 shrink-0" />
                            <span>{flashcard.word.definitions[0].englishExample}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="text-right text-xs text-slate-400 shrink-0 pl-4">
                        {flashcard.correctCount > 0 || flashcard.wrongCount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 font-medium">✓ {flashcard.correctCount}</span>
                            <span className="text-rose-600 font-medium">✗ {flashcard.wrongCount}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Chưa ôn</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-line py-8">
                  <p>Không tìm thấy từ nào phù hợp với "{filterQuery}".</p>
                </div>
              )
            ) : (
              <div className="empty-line flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center mb-3">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Bộ từ này đang trống</h3>
                <p className="text-slate-500 text-sm mb-4 max-w-sm text-center">
                  Hãy tra cứu từ vựng mới và lưu vào bộ từ này để bắt đầu học flashcard.
                </p>
                <Link className="button button-primary" to="/">
                  <PlusCircle size={16} />
                  <span>Tra từ để thêm vào bộ</span>
                </Link>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  )
}
