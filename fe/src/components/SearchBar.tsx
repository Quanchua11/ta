import { useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Button } from './Button'

interface SearchBarProps {
  value: string
  isLoading: boolean
  onChange: (value: string) => void
  onSubmit: () => void
  onClear: () => void
  suggestions: string[]
  onSelectSuggestion: (word: string) => void
}

export function SearchBar({
  value,
  isLoading,
  onChange,
  onSubmit,
  onClear,
  suggestions,
  onSelectSuggestion,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <form
      className="search-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="search-input-wrap">
        <label className="sr-only" htmlFor="word-search">
          Từ tiếng Anh
        </label>
        <div className="search-icon-adornment" aria-hidden="true">
          <Search size={18} />
        </div>
        <input
          ref={inputRef}
          id="word-search"
          className="search-input"
          type="search"
          value={value}
          placeholder="Nhập từ tiếng Anh để tra nghĩa (vd: resilient, ephemeral...)"
          autoComplete="off"
          spellCheck="false"
          onChange={(event) => onChange(event.target.value)}
        />
        {value ? (
          <button
            className="search-clear"
            type="button"
            aria-label="Xoá từ khoá"
            onClick={() => {
              onClear()
              inputRef.current?.focus()
            }}
          >
            <X size={15} />
          </button>
        ) : null}
        {suggestions.length > 0 ? (
          <ul className="suggestion-list" role="listbox" aria-label="Gợi ý từ">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  role="option"
                  onClick={() => onSelectSuggestion(suggestion)}
                >
                  <Search size={15} className="text-slate-400" />
                  <span>{suggestion}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Button
        type="submit"
        variant="primary"
        disabled={isLoading || !value.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Đang tìm…</span>
          </>
        ) : (
          <>
            <Search size={16} />
            <span>Tìm từ</span>
          </>
        )}
      </Button>
    </form>
  )
}
