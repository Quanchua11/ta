import type { Flashcard, ReviewResult } from '../types'
import { jsonBody, request } from './api'

export function listFlashcards(wordSetId: string) {
  return request<Flashcard[]>(`/api/word-sets/${encodeURIComponent(wordSetId)}/flashcards`)
}

export function getNextFlashcard(wordSetId: string) {
  return request<Flashcard>(`/api/word-sets/${encodeURIComponent(wordSetId)}/flashcards/next`)
}

export function reviewFlashcard(id: string, result: ReviewResult) {
  return request<Flashcard>(`/api/flashcards/${encodeURIComponent(id)}/review`, jsonBody({ result }))
}
