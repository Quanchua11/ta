export interface Meaning {
  partOfSpeech: string
  vietnamese: string[]
  examples: string[]
}

export interface DictionaryResult {
  word: string
  phonetic: string | null
  meanings: Meaning[]
  audioUrl: string | null
  source: string
}

export interface WordDefinition {
  id: string
  partOfSpeech: string | null
  vietnameseMeaning: string
  englishExample: string | null
  source: string | null
}

export interface Word {
  id: string
  word: string
  normalizedWord: string
  phonetic: string | null
  audioUrl: string | null
  createdAt: string
  definitions?: WordDefinition[]
}

export interface WordSet {
  id: string
  name: string
  description: string | null
  userId: string | null
  createdAt: string
  updatedAt: string
  _count?: { flashcards: number }
  flashcards?: Flashcard[]
}

export interface Flashcard {
  id: string
  wordId: string
  wordSetId: string
  status: string
  correctCount: number
  wrongCount: number
  nextReviewAt: string | null
  createdAt: string
  updatedAt: string
  word: Word
}

export type ReviewResult = 'again' | 'hard' | 'good' | 'easy'

export interface SaveWordResponse {
  word: Word
  flashcard: Flashcard
  created: boolean
}
