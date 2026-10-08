import { useParams } from 'react-router-dom'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Trophy,
  RotateCw,
  Volume2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { getNextFlashcard, listFlashcards, reviewFlashcard } from '../services/flashcardApi'
import { getWordSet } from '../services/wordSetApi'
import type { Flashcard, ReviewResult, WordSet } from '../types'
import { Button } from '../components/Button'

export function StudyPage() {
  const { id } = useParams()
  const [wordSet, setWordSet] = useState<WordSet | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [error, setError] = useState('')
  const [reviewedCount, setReviewedCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const loadInitial = useCallback(() => {
    if (!id) return
    setIsLoading(true)
    setIsFlipped(false)
    setError('')
    setIsFinished(false)
    setCurrentIndex(0)

    // Load word set info for title & total count
    void getWordSet(id)
      .then(setWordSet)
      .catch(() => undefined)

    // Load next card for spaced repetition review
    void getNextFlashcard(id)
      .then((firstCard) => {
        setCards([firstCard])
        setCurrentIndex(0)
      })
      .catch(async (loadError: unknown) => {
        const is404 =
          (loadError instanceof Error && 'status' in loadError && (loadError as { status: number }).status === 404) ||
          (typeof loadError === 'object' && loadError !== null && 'status' in loadError && (loadError as { status: number }).status === 404)

        if (is404) {
          try {
            const allCards = await listFlashcards(id)
            if (allCards.length > 0) {
              setCards(allCards)
              setCurrentIndex(0)
              return
            }
          } catch {
            // Ignore
          }
          setIsFinished(true)
        } else {
          setError(loadError instanceof Error ? loadError.message : 'Không tải được flashcard.')
        }
      })
      .finally(() => setIsLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    let isMounted = true

    void getWordSet(id)
      .then((ws) => {
        if (isMounted) setWordSet(ws)
      })
      .catch(() => undefined)

    void getNextFlashcard(id)
      .then((firstCard) => {
        if (!isMounted) return
        setCards([firstCard])
        setCurrentIndex(0)
      })
      .catch(async (loadError: unknown) => {
        if (!isMounted) return
        const is404 =
          (loadError instanceof Error && 'status' in loadError && (loadError as { status: number }).status === 404) ||
          (typeof loadError === 'object' && loadError !== null && 'status' in loadError && (loadError as { status: number }).status === 404)

        if (is404) {
          try {
            const allCards = await listFlashcards(id)
            if (allCards.length > 0 && isMounted) {
              setCards(allCards)
              setCurrentIndex(0)
              return
            }
          } catch {
            // Ignore
          }
          if (isMounted) setIsFinished(true)
        } else {
          if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Không tải được flashcard.')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false)
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const handleNext = useCallback(async () => {
    if (!id) return
    setIsFlipped(false)

    // If there is already a card ahead in history, advance to it
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return
    }

    // Otherwise, fetch the next flashcard from the server
    setIsLoadingMore(true)
    try {
      const nextCard = await getNextFlashcard(id)
      setCards((prev) => [...prev, nextCard])
      setCurrentIndex((prev) => prev + 1)
    } catch (nextError: unknown) {
      const is404 =
        (nextError instanceof Error && 'status' in nextError && (nextError as { status: number }).status === 404) ||
        (typeof nextError === 'object' && nextError !== null && 'status' in nextError && (nextError as { status: number }).status === 404)
      if (is404) {
        setIsFinished(true)
      } else {
        setError(nextError instanceof Error ? nextError.message : 'Không tải được thẻ tiếp theo.')
      }
    } finally {
      setIsLoadingMore(false)
    }
  }, [id, currentIndex, cards.length])

  const handleReview = useCallback(
    async (result: ReviewResult) => {
      const currentCard = cards[currentIndex]
      if (!currentCard) return
      try {
        await reviewFlashcard(currentCard.id, result)
        setReviewedCount((prev) => prev + 1)
        void handleNext()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không gửi được đánh giá.')
      }
    },
    [cards, currentIndex, handleNext]
  )

  // Keyboard shortcut support: Space / Enter to flip; ArrowLeft / ArrowRight to navigate; 1, 2, 3, 4 to review
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is focused inside an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault()
        if (cards.length > 0 && !isLoading) {
          setIsFlipped((prev) => !prev)
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentIndex > 0 && !isLoading && !isLoadingMore) {
          handlePrevious()
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (!isLoading && !isLoadingMore) {
          void handleNext()
        }
      } else if (isFlipped && cards[currentIndex] && !isLoading && !isLoadingMore) {
        if (e.key === '1') {
          e.preventDefault()
          void handleReview('again')
        } else if (e.key === '2') {
          e.preventDefault()
          void handleReview('hard')
        } else if (e.key === '3') {
          e.preventDefault()
          void handleReview('good')
        } else if (e.key === '4') {
          e.preventDefault()
          void handleReview('easy')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cards, currentIndex, isFlipped, isLoading, isLoadingMore, handlePrevious, handleNext, handleReview])

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentCard = cards[currentIndex]
    if (!audioRef.current || !currentCard?.word.audioUrl) return
    audioRef.current.currentTime = 0
    void audioRef.current.play()
  }

  const currentCard = cards[currentIndex]
  const totalCardsInSet = wordSet?._count?.flashcards ?? wordSet?.flashcards?.length

  return (
    <div className="page-content study-page">
      <Link className="back-link" to={`/word-sets/${id ?? ''}`}>
        <ArrowLeft size={16} />
        <span>Quay lại bộ từ</span>
      </Link>

      <header className="page-heading text-center">
        <div className="eyebrow justify-center">
          <RotateCw size={14} />
          <span>{wordSet ? `Bộ từ: ${wordSet.name}` : 'Phiên ôn tập Flashcard'}</span>
        </div>
        <h1>Luyện tập Flashcard</h1>
        <p className="page-description">
          Lật thẻ để xem nghĩa, sau đó đánh giá mức độ nhớ để lên lịch ôn tiếp theo.
        </p>
      </header>

      {error ? (
        <div className="error-state" role="alert">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <strong>Không tải được flashcard</strong>
            <span>{error}</span>
            <button
              className="text-link mt-2 inline-flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900"
              type="button"
              onClick={loadInitial}
            >
              <span>Thử lại</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="content-card loading-card min-h-[340px] flex flex-col justify-center">
          <div className="skeleton-line skeleton-short mx-auto" />
          <div className="skeleton-line skeleton-wide mx-auto mt-4" />
          <div className="skeleton-line skeleton-medium mx-auto" />
        </div>
      ) : null}

      {!isLoading && !error && isFinished ? (
        <div className="content-card empty-study">
          <Trophy className="study-trophy-icon" />
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
            Đã hoàn thành phiên ôn tập!
          </h2>
          <p className="text-slate-600 mb-2 max-w-md">
            Hiện tại bạn đã ôn tập xong tất cả các flashcard đến hạn trong bộ từ này.
          </p>
          {reviewedCount > 0 ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-6">
              <CheckCircle size={15} />
              <span>Đã ôn tập thành công {reviewedCount} flashcard trong phiên này!</span>
            </div>
          ) : (
            <div className="mb-6" />
          )}
          <div className="flex items-center gap-3">
            <Link className="button button-outline" to={`/word-sets/${id ?? ''}`}>
              Xem danh sách bộ từ
            </Link>
            {cards.length > 0 ? (
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setCurrentIndex(0)
                  setIsFinished(false)
                  setIsFlipped(false)
                }}
              >
                <span>Xem lại từ đầu ({cards.length} thẻ)</span>
              </Button>
            ) : null}
            <Button variant="primary" type="button" onClick={loadInitial}>
              <RotateCw size={15} />
              <span>Kiểm tra lại thẻ</span>
            </Button>
          </div>
        </div>
      ) : null}

      {!isLoading && !error && !isFinished && currentCard ? (
        <>
          {currentCard.word.audioUrl ? (
            <audio ref={audioRef} src={currentCard.word.audioUrl} />
          ) : null}

          {/* Flashcard Component */}
          <div className="flashcard-wrapper">
            <button
              className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}
              type="button"
              onClick={() => setIsFlipped((current) => !current)}
              aria-label={isFlipped ? 'Mặt sau flashcard' : 'Mặt trước flashcard'}
            >
              <div className="flashcard-label">
                {isFlipped ? 'Mặt sau • Nghĩa & Ví dụ' : 'Mặt trước • Từ vựng tiếng Anh'}
              </div>

              <div className="flashcard-content-center">
                {isFlipped ? (
                  <>
                    <div className="study-meaning-wrap">
                      <strong className="study-meaning-text">
                        {currentCard.word.definitions
                          ?.map((def) => def.vietnameseMeaning)
                          .filter(Boolean)
                          .join(', ') || 'Chưa có bản dịch tiếng Việt'}
                      </strong>
                    </div>

                    {currentCard.word.definitions?.[0]?.englishExample ? (
                      <p className="study-example mt-2">
                        "{currentCard.word.definitions[0].englishExample}"
                      </p>
                    ) : null}

                    {currentCard.word.audioUrl ? (
                      <button
                        type="button"
                        onClick={playAudio}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors mt-2"
                        title="Nghe phát âm"
                      >
                        <Volume2 size={14} />
                        <span>Nghe phát âm</span>
                      </button>
                    ) : null}
                  </>
                ) : (
                  <>
                    <strong className="study-word-title">{currentCard.word.word}</strong>
                    {currentCard.word.phonetic ? (
                      <span className="study-phonetic">{currentCard.word.phonetic}</span>
                    ) : null}
                    {currentCard.word.audioUrl ? (
                      <button
                        type="button"
                        onClick={playAudio}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-700 transition-colors mt-1"
                        title="Nghe phát âm"
                      >
                        <Volume2 size={14} />
                        <span>Nghe phát âm</span>
                      </button>
                    ) : null}
                  </>
                )}
              </div>

              <div className="flashcard-flip-prompt">
                {isFlipped
                  ? 'Nhấn vào thẻ hoặc Space để xem lại mặt trước'
                  : '💡 Chạm vào thẻ hoặc nhấn phím Space để lật mặt sau'}
              </div>
            </button>
          </div>

          {/* Next & Previous Navigation Controls */}
          <div className="study-nav-controls">
            <Button
              type="button"
              variant="outline"
              disabled={currentIndex <= 0 || isLoading}
              onClick={handlePrevious}
              className="study-nav-btn"
              title="Quay lại thẻ trước (hoặc phím mũi tên trái ←)"
            >
              <ChevronLeft size={16} />
              <span>Quay lại</span>
            </Button>

            <div className="study-counter-badge">
              <span>Thẻ {currentIndex + 1}</span>
              {totalCardsInSet ? (
                <span className="text-slate-400"> / {totalCardsInSet}</span>
              ) : cards.length > 1 ? (
                <span className="text-slate-400"> / {cards.length}</span>
              ) : null}
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading || isLoadingMore}
              onClick={() => void handleNext()}
              className="study-nav-btn"
              title="Chuyển sang thẻ tiếp theo (hoặc phím mũi tên phải →)"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang tải…</span>
                </>
              ) : (
                <>
                  <span>Tiếp theo</span>
                  <ChevronRight size={16} />
                </>
              )}
            </Button>
          </div>

          {/* Spaced Repetition Rating Buttons */}
          {isFlipped ? (
            <div className="review-actions">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Mức độ ghi nhớ của bạn đối với từ này:
              </span>
              <div className="review-buttons-grid">
                <button
                  type="button"
                  className="review-btn review-btn-again"
                  onClick={() => void handleReview('again')}
                  title="Nhấn phím 1"
                >
                  <span className="review-btn-name">Chưa nhớ</span>
                  <span className="review-btn-hint">Again (1)</span>
                </button>
                <button
                  type="button"
                  className="review-btn review-btn-hard"
                  onClick={() => void handleReview('hard')}
                  title="Nhấn phím 2"
                >
                  <span className="review-btn-name">Khó nhớ</span>
                  <span className="review-btn-hint">Hard (2)</span>
                </button>
                <button
                  type="button"
                  className="review-btn review-btn-good"
                  onClick={() => void handleReview('good')}
                  title="Nhấn phím 3"
                >
                  <span className="review-btn-name">Đã nhớ</span>
                  <span className="review-btn-hint">Good (3)</span>
                </button>
                <button
                  type="button"
                  className="review-btn review-btn-easy"
                  onClick={() => void handleReview('easy')}
                  title="Nhấn phím 4"
                >
                  <span className="review-btn-name">Rất dễ</span>
                  <span className="review-btn-hint">Easy (4)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center mt-2 text-xs text-slate-400">
              Phím tắt: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600 border border-slate-200">Space</kbd> Lật thẻ • <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600 border border-slate-200">←</kbd> Quay lại • <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600 border border-slate-200">→</kbd> Tiếp theo
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
