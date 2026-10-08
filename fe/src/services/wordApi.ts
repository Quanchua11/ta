import type { SaveWordResponse } from '../types'
import { jsonBody, request } from './api'

export function saveWord(word: string, wordSetId: string) {
  return request<SaveWordResponse>('/api/words', jsonBody({ word, wordSetId }))
}
