import type { DictionaryProvider, DictionaryResult } from '../types/dictionary.js'

export interface DictionaryRepository {
  findByNormalizedWord(normalizedWord: string): Promise<DictionaryResult | null>
  save(result: DictionaryResult): Promise<DictionaryResult>
}

export class DictionaryService {
  constructor(
    private readonly provider: DictionaryProvider,
    private readonly translationProvider?: DictionaryProvider,
    private readonly repository?: DictionaryRepository,
  ) {}

  async search(word: string): Promise<DictionaryResult | null> {
    const normalizedWord = word.trim().toLowerCase()

    if (!normalizedWord || normalizedWord.length > 100) {
      return null
    }

    if (this.repository) {
      const cachedResult = await this.repository.findByNormalizedWord(normalizedWord)
      if (cachedResult && (!this.translationProvider || cachedResult.meanings.some((meaning) => meaning.vietnamese.length > 0))) {
        return cachedResult
      }
    }

    const result = await this.provider.search(normalizedWord)
    if (!result || !this.translationProvider) {
      return result && this.repository ? this.repository.save(result) : result
    }

    try {
      const translation = await this.translationProvider.search(normalizedWord)
      if (!translation) {
        return this.repository ? this.repository.save(result) : result
      }

      const vietnamese = translation.meanings.flatMap((meaning) => meaning.vietnamese)
      const firstMeaning = result.meanings[0]

      const mergedResult = {
        ...result,
        meanings: firstMeaning
          ? [
              {
                ...firstMeaning,
                vietnamese: [...new Set(vietnamese)],
              },
              ...result.meanings.slice(1),
            ]
          : translation.meanings,
        source: `${result.source}, ${translation.source}`,
      }

      return this.repository ? this.repository.save(mergedResult) : mergedResult
    } catch {
      // Translation is optional; keep the English dictionary result available.
      return this.repository ? this.repository.save(result) : result
    }
  }
}
