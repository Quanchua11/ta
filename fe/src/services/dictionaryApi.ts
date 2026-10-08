import type { DictionaryResult } from '../types'
import { request } from './api'

export function searchWord(word: string) {
  return request<DictionaryResult>(`/api/dictionary/search?word=${encodeURIComponent(word)}`)
}
