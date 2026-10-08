import { useEffect, useState } from 'react'
import { X, FolderPlus, Bookmark, Loader2, Sparkles } from 'lucide-react'
import type { DictionaryResult, WordSet } from '../types'
import { saveWord } from '../services/wordApi'
import { createWordSet } from '../services/wordSetApi'
import { Button } from './Button'

interface SaveWordDialogProps {
  result: DictionaryResult
  wordSets: WordSet[]
  onClose: () => void
  onSaved: (message: string) => void
  onWordSetCreated: (wordSet: WordSet) => void
}

export function SaveWordDialog({
  result,
  wordSets,
  onClose,
  onSaved,
  onWordSetCreated,
}: SaveWordDialogProps) {
  const [selectedId, setSelectedId] = useState(wordSets[0]?.id ?? '')
  const [isCreating, setIsCreating] = useState(wordSets.length === 0)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isCreatingSet, setIsCreatingSet] = useState(false)
  const [error, setError] = useState('')

  // ESC to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleCreateSet() {
    if (!newName.trim()) {
      setError('Hãy nhập tên bộ từ.')
      return
    }

    setIsCreatingSet(true)
    setError('')
    try {
      const wordSet = await createWordSet(newName.trim(), newDescription.trim())
      onWordSetCreated(wordSet)
      setSelectedId(wordSet.id)
      setIsCreating(false)
      setNewName('')
      setNewDescription('')
    } catch (creationError) {
      setError(creationError instanceof Error ? creationError.message : 'Không tạo được bộ từ.')
    } finally {
      setIsCreatingSet(false)
    }
  }

  async function handleSave() {
    if (!selectedId) {
      setError('Hãy chọn hoặc tạo một bộ từ.')
      return
    }

    setIsSaving(true)
    setError('')
    try {
      const response = await saveWord(result.word, selectedId)
      onSaved(response.created ? `Đã lưu từ “${result.word}” và tạo flashcard thành công!` : `Từ “${result.word}” đã có trong bộ từ này.`)
      onClose()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không lưu được từ.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-word-title"
      >
        <header className="modal-header">
          <div>
            <h2 id="save-word-title">Lưu từ vào bộ từ</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-sm">
                <Bookmark size={13} />
                {result.word}
              </span>
              {result.phonetic ? (
                <span className="text-slate-500 text-xs font-mono">
                  {result.phonetic}
                </span>
              ) : null}
            </div>
          </div>
          <button
            className="close-button"
            type="button"
            aria-label="Đóng"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        {wordSets.length > 0 ? (
          <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
            <button
              type="button"
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                !isCreating
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setIsCreating(false)}
            >
              Chọn bộ có sẵn
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                isCreating
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setIsCreating(true)}
            >
              + Tạo bộ từ mới
            </button>
          </div>
        ) : null}

        {!isCreating && wordSets.length > 0 ? (
          <div className="field-group">
            <label htmlFor="word-set-select">Chọn bộ từ lưu vào</label>
            <select
              id="word-set-select"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              <option value="">-- Chọn một bộ từ --</option>
              {wordSets.map((wordSet) => (
                <option key={wordSet.id} value={wordSet.id}>
                  {wordSet.name} ({wordSet._count?.flashcards ?? 0} từ)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="field-stack">
            <div className="field-group">
              <label htmlFor="new-word-set-name">Tên bộ từ mới *</label>
              <input
                id="new-word-set-name"
                placeholder="Ví dụ: Từ vựng IELTS, Giao tiếp hàng ngày..."
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                maxLength={150}
              />
            </div>
            <div className="field-group">
              <label htmlFor="new-word-set-description">
                Mô tả <span className="text-slate-400 font-normal">(tuỳ chọn)</span>
              </label>
              <textarea
                id="new-word-set-description"
                placeholder="Ghi chú thêm về mục đích của bộ từ này..."
                rows={3}
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                maxLength={2000}
              />
            </div>
            <div className="inline-actions">
              <Button
                type="button"
                variant="outline"
                disabled={isCreatingSet || !newName.trim()}
                onClick={() => void handleCreateSet()}
              >
                {isCreatingSet ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang tạo…</span>
                  </>
                ) : (
                  <>
                    <FolderPlus size={15} />
                    <span>Tạo và chọn bộ này</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <footer className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={isSaving || isCreating || !selectedId}
            onClick={() => void handleSave()}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang lưu…</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Lưu từ & Tạo flashcard</span>
              </>
            )}
          </Button>
        </footer>
      </section>
    </div>
  )
}
