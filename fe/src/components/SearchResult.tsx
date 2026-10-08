import type { DictionaryResult } from '../types'
import { BookmarkPlus, Globe, Sparkles } from 'lucide-react'
import { Button } from './Button'
import { MeaningList } from './MeaningList'
import { PronunciationButton } from './PronunciationButton'

interface SearchResultProps {
  result: DictionaryResult
  onSave: () => void
}

export function SearchResult({ result, onSave }: SearchResultProps) {
  return (
    <section className="content-card result-card animate-fade-in" aria-label={`Kết quả cho ${result.word}`}>
      <header className="result-header">
        <div>
          <div className="flex items-center gap-3">
            <h2>{result.word}</h2>
          </div>
          {result.phonetic ? (
            <p className="phonetic" title="Phiên âm quốc tế IPA">
              {result.phonetic}
            </p>
          ) : null}
        </div>
        <div className="result-actions">
          <PronunciationButton audioUrl={result.audioUrl} />
          <Button variant="primary" type="button" onClick={onSave} title="Lưu từ vào bộ từ để tạo flashcard ôn tập">
            <BookmarkPlus size={16} />
            <span>Lưu vào bộ từ</span>
          </Button>
        </div>
      </header>
      <MeaningList meanings={result.meanings} />
      <footer className="result-footer">
        <span className="flex items-center gap-1.5">
          <Globe size={13} />
          <span>Nguồn từ điển: <strong>{result.source}</strong></span>
        </span>
        <span className="flex items-center gap-1 text-indigo-500 font-medium">
          <Sparkles size={13} />
          <span>Sẵn sàng tạo flashcard</span>
        </span>
      </footer>
    </section>
  )
}
