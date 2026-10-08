import { useState } from 'react'
import { Check, FolderPlus, Loader2 } from 'lucide-react'
import type { WordSet } from '../types'
import { Button } from './Button'

interface WordSetFormProps {
  initialValue?: WordSet
  onSubmit: (name: string, description: string) => Promise<void>
  onCancel?: () => void
}

export function WordSetForm({ initialValue, onSubmit, onCancel }: WordSetFormProps) {
  const [name, setName] = useState(initialValue?.name ?? '')
  const [description, setDescription] = useState(initialValue?.description ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  return (
    <form
      className="word-set-form"
      onSubmit={async (event) => {
        event.preventDefault()
        if (!name.trim()) {
          setError('Vui lòng nhập tên bộ từ.')
          return
        }
        setIsSaving(true)
        setError('')
        try {
          await onSubmit(name.trim(), description.trim())
        } catch (submitError) {
          setError(submitError instanceof Error ? submitError.message : 'Không lưu được bộ từ.')
        } finally {
          setIsSaving(false)
        }
      }}
    >
      <div className="field-group">
        <label htmlFor="word-set-name">
          Tên bộ từ <span className="text-rose-500">*</span>
        </label>
        <input
          id="word-set-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ví dụ: Từ vựng TOEIC 800+, Từ vựng du lịch..."
          required
          maxLength={150}
        />
      </div>

      <div className="field-group">
        <div className="flex justify-between items-center">
          <label htmlFor="word-set-description">
            Mô tả <span className="text-slate-400 font-normal">(tuỳ chọn)</span>
          </label>
          <span className="text-xs text-slate-400">{description.length}/2000</span>
        </div>
        <textarea
          id="word-set-description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Mô tả mục đích hoặc kế hoạch học của bộ từ này..."
          maxLength={2000}
        />
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="inline-actions">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Huỷ
          </Button>
        ) : null}
        <Button type="submit" variant="primary" disabled={isSaving || !name.trim()}>
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Đang lưu…</span>
            </>
          ) : initialValue ? (
            <>
              <Check size={16} />
              <span>Cập nhật</span>
            </>
          ) : (
            <>
              <FolderPlus size={16} />
              <span>Tạo bộ từ</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
