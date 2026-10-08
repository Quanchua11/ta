import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../services/api'
import { searchWord } from '../services/dictionaryApi'
import { listWordSets } from '../services/wordSetApi'
import { suggestWords } from '../services/suggestionApi'
import type { DictionaryResult, WordSet } from '../types'
import { SaveWordDialog } from '../components/SaveWordDialog'
import { SearchBar } from '../components/SearchBar'
import { SearchResult } from '../components/SearchResult'
import { CheckCircle2, AlertCircle, Sparkles, BookOpen, Lightbulb, ArrowRight } from 'lucide-react'

const POPULAR_WORDS = ['resilience', 'eloquent', 'ephemeral', 'serendipity', 'ubiquitous', 'aesthetic']

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<DictionaryResult | null>(null)
  const [wordSets, setWordSets] = useState<WordSet[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const requestVersion = useRef(0)

  useEffect(() => {
    void listWordSets().then(setWordSets).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!showSuggestions) return
    let active = true
    const prefix = query.trim()
    const timer = window.setTimeout(() => {
      if (!prefix) {
        setSuggestions([])
        return
      }

      void suggestWords(prefix)
        .then((response) => {
          if (active) setSuggestions(response.suggestions)
        })
        .catch(() => {
          if (active) setSuggestions([])
        })
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [query, showSuggestions])

  async function runSearch(word: string) {
    if (isLoading) return
    if (!word) {
      setError('Hãy nhập một từ tiếng Anh để bắt đầu tra cứu.')
      return
    }

    setIsLoading(true)
    setError('')
    setNotice('')
    setSuggestions([])
    setShowSuggestions(false)
    const version = ++requestVersion.current
    try {
      const response = await searchWord(word)
      if (version === requestVersion.current) setResult(response)
    } catch (searchError) {
      if (version !== requestVersion.current) return
      setResult(null)
      setError(
        searchError instanceof ApiError && searchError.status === 404
          ? `Không tìm thấy từ “${word}” trong từ điển. Hãy thử kiểm tra lại chính tả hoặc chọn từ khác.`
          : searchError instanceof Error
          ? searchError.message
          : 'Không thể kết nối đến máy chủ từ điển.'
      )
    } finally {
      if (version === requestVersion.current) setIsLoading(false)
    }
  }

  function handleSearch() {
    void runSearch(query.trim())
  }

  function handleSelectSuggestion(word: string) {
    setQuery(word)
    void runSearch(word)
  }

  function handleSelectChip(word: string) {
    setQuery(word)
    void runSearch(word)
  }

  return (
    <div className="page-content">
      <header className="page-heading">
        <div className="eyebrow">
          <Sparkles size={14} />
          <span>Từ điển & Flashcard thông minh</span>
        </div>
        <h1>Tìm từ vựng tiếng Anh</h1>
        <p className="page-description">
          Tra nghĩa tiếng Việt chuẩn xác, phát âm bản xứ, ví dụ thực tế và lưu trực tiếp thành flashcard để ghi nhớ dài hạn.
        </p>
      </header>

      <SearchBar
        value={query}
        isLoading={isLoading}
        suggestions={
          showSuggestions
            ? suggestions.filter((word) =>
                word.toLowerCase().startsWith(query.trim().toLowerCase())
              )
            : []
        }
        onChange={(value) => {
          requestVersion.current++
          setIsLoading(false)
          setQuery(value)
          setSuggestions([])
          setShowSuggestions(true)
        }}
        onSubmit={handleSearch}
        onSelectSuggestion={handleSelectSuggestion}
        onClear={() => {
          requestVersion.current++
          setIsLoading(false)
          setQuery('')
          setResult(null)
          setError('')
          setSuggestions([])
          setShowSuggestions(false)
        }}
      />

      {/* Popular Word Chips */}
      <div className="quick-chips-wrapper">
        <span className="chip-label">Từ gợi ý tra nhanh:</span>
        {POPULAR_WORDS.map((word) => (
          <button
            key={word}
            type="button"
            className="chip-button"
            onClick={() => handleSelectChip(word)}
          >
            <span>{word}</span>
          </button>
        ))}
      </div>

      {notice ? (
        <div className="notice" role="status">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      {error ? (
        <div className="error-state" role="alert">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <strong>Không tải được kết quả</strong>
            <span>{error}</span>
            <button
              className="text-link mt-2 inline-flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900"
              type="button"
              onClick={() => void handleSearch()}
            >
              <span>Thử lại</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="content-card loading-card" aria-busy="true">
          <span className="sr-only">Đang tải kết quả</span>
          <div className="skeleton-line skeleton-wide" />
          <div className="skeleton-line skeleton-medium" />
          <div className="skeleton-line skeleton-short" />
          <div className="skeleton-line skeleton-wide mt-4" />
          <div className="skeleton-line skeleton-medium" />
        </div>
      ) : null}

      {!isLoading && !error && !result ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="content-card flex flex-col justify-center items-start">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center mb-3">
              <BookOpen size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Bắt đầu tra cứu</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Nhập bất kỳ từ tiếng Anh nào vào thanh tìm kiếm bên trên hoặc chọn một trong các từ gợi ý phổ biến.
            </p>
          </div>

          <div className="content-card flex flex-col justify-center items-start border-indigo-100 bg-indigo-50/40">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 grid place-items-center mb-3">
              <Lightbulb size={20} />
            </div>
            <h2 className="text-lg font-bold text-indigo-900 mb-1">Mẹo học từ vựng</h2>
            <p className="text-sm text-indigo-800/80 leading-relaxed">
              Sau khi tìm thấy từ ưng ý, hãy nhấn <strong>“Lưu vào bộ từ”</strong> để tự động tạo Flashcard với thuật toán Spaced Repetition.
            </p>
          </div>
        </div>
      ) : null}

      {!isLoading && result ? (
        <SearchResult result={result} onSave={() => setIsSaveOpen(true)} />
      ) : null}

      {isSaveOpen && result ? (
        <SaveWordDialog
          result={result}
          wordSets={wordSets}
          onClose={() => setIsSaveOpen(false)}
          onSaved={setNotice}
          onWordSetCreated={(wordSet) =>
            setWordSets((current) => [...current, wordSet])
          }
        />
      ) : null}
    </div>
  )
}
