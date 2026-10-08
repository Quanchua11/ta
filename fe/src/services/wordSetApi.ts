import type { WordSet } from '../types'
import { jsonBody, request } from './api'

export function listWordSets() {
  return request<WordSet[]>('/api/word-sets')
}

export function getWordSet(id: string) {
  return request<WordSet>(`/api/word-sets/${encodeURIComponent(id)}`)
}

export function createWordSet(name: string, description?: string) {
  return request<WordSet>('/api/word-sets', jsonBody({ name, description }))
}

export function updateWordSet(id: string, body: { name?: string; description?: string | null }) {
  return request<WordSet>(`/api/word-sets/${encodeURIComponent(id)}`, {
    ...jsonBody(body),
    method: 'PATCH',
  })
}

export function deleteWordSet(id: string) {
  return request<void>(`/api/word-sets/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
