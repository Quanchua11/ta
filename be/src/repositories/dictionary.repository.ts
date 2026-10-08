import type { PrismaClient } from '@prisma/client'
import type { DictionaryResult } from '../types/dictionary.js'

type WordWithDefinitions = Awaited<ReturnType<PrismaClient['word']['findUnique']>> & {
  definitions: Array<{
    partOfSpeech: string | null
    vietnameseMeaning: string
    englishExample: string | null
    source: string | null
  }>
}

export class DictionaryRepository {
  constructor(private readonly database: PrismaClient) {}

  async findByNormalizedWord(normalizedWord: string): Promise<DictionaryResult | null> {
    const word = await this.database.word.findUnique({
      where: { normalizedWord },
      include: { definitions: true },
    })

    return word ? this.toResult(word) : null
  }

  async save(result: DictionaryResult): Promise<DictionaryResult> {
    const savedWord = await this.database.$transaction(async (transaction) => {
      const word = await transaction.word.upsert({
        where: { normalizedWord: result.word.trim().toLowerCase() },
        update: {
          word: result.word,
          phonetic: result.phonetic,
          audioUrl: result.audioUrl,
        },
        create: {
          word: result.word,
          normalizedWord: result.word.trim().toLowerCase(),
          phonetic: result.phonetic,
          audioUrl: result.audioUrl,
        },
      })

      await transaction.wordDefinition.deleteMany({ where: { wordId: word.id } })
      const definitions = result.meanings.flatMap((meaning) => {
        const translations = meaning.vietnamese.length > 0 ? meaning.vietnamese : ['']

        return translations.map((vietnameseMeaning) => ({
          wordId: word.id,
          partOfSpeech: meaning.partOfSpeech,
          vietnameseMeaning,
          englishExample: meaning.examples.join('\n') || null,
          source: result.source,
        }))
      })

      if (definitions.length > 0) {
        await transaction.wordDefinition.createMany({ data: definitions })
      }

      return transaction.word.findUniqueOrThrow({
        where: { id: word.id },
        include: { definitions: true },
      })
    })

    return this.toResult(savedWord)
  }

  private toResult(word: WordWithDefinitions): DictionaryResult {
    return {
      word: word.word,
      phonetic: word.phonetic,
      audioUrl: word.audioUrl,
      meanings: word.definitions.map((definition) => ({
        partOfSpeech: definition.partOfSpeech ?? 'unknown',
        vietnamese: definition.vietnameseMeaning ? [definition.vietnameseMeaning] : [],
        examples: definition.englishExample ? definition.englishExample.split('\n') : [],
      })),
      source: [...new Set(word.definitions.map((definition) => definition.source).filter(Boolean))].join(', ') || 'database',
    }
  }
}
