import type { Meaning } from '../types'
import { Quote, CheckCircle2 } from 'lucide-react'

function getPosClass(pos: string) {
  const lower = pos.toLowerCase()
  if (lower.includes('noun')) return 'pos-noun'
  if (lower.includes('verb')) return 'pos-verb'
  if (lower.includes('adj')) return 'pos-adjective'
  if (lower.includes('adv')) return 'pos-adverb'
  return 'pos-default'
}

function getPosLabel(pos: string) {
  const lower = pos.toLowerCase()
  if (lower === 'noun') return 'Danh từ (n)'
  if (lower === 'verb') return 'Động từ (v)'
  if (lower === 'adjective') return 'Tính từ (adj)'
  if (lower === 'adverb') return 'Trạng từ (adv)'
  if (lower === 'preposition') return 'Giới từ (prep)'
  if (lower === 'conjunction') return 'Liên từ (conj)'
  return pos
}

export function MeaningList({ meanings }: { meanings: Meaning[] }) {
  if (meanings.length === 0) {
    return (
      <div className="empty-line">
        <p>Chưa có thông tin định nghĩa cho từ này.</p>
      </div>
    )
  }

  return (
    <ol className="meaning-list">
      {meanings.map((meaning, index) => (
        <li key={`${meaning.partOfSpeech}-${index}`} className="meaning-item">
          <div className="meaning-heading">
            <span className={`part-of-speech-badge ${getPosClass(meaning.partOfSpeech)}`}>
              {getPosLabel(meaning.partOfSpeech)}
            </span>
          </div>

          {meaning.vietnamese.length > 0 ? (
            <ul className="translation-list">
              {meaning.vietnamese.map((translation) => (
                <li key={translation} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
                  <span>{translation}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">Chưa có bản dịch tiếng Việt.</p>
          )}

          {meaning.examples.length > 0 ? (
            <div className="example-list">
              {meaning.examples.slice(0, 3).map((example) => (
                <div key={example} className="example-card">
                  <Quote size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span>{example}</span>
                </div>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
