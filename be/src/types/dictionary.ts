export interface DictionaryMeaning {
  partOfSpeech: string
  vietnamese: string[]
  examples: string[]
}

export interface DictionaryResult {
  word: string
  phonetic: string | null
  meanings: DictionaryMeaning[]
  audioUrl: string | null
  source: string
}

export interface DictionaryProvider {
  search(word: string): Promise<DictionaryResult | null>
}
