import type { PrismaClient } from '@prisma/client'
import { HttpError } from '../errors/http-error.js'
import type { DictionaryResult } from '../types/dictionary.js'

export class WordService {
  constructor(
    private readonly database: PrismaClient,
    private readonly dictionarySearch: (word: string) => Promise<DictionaryResult | null>,
  ) {}

  async saveWord(wordValue: string, wordSetId: string) {
    const word = wordValue.trim().toLowerCase()

    if (!word || word.length > 100 || !wordSetId.trim()) {
      throw new HttpError(400, 'INVALID_WORD', 'Word and wordSetId are required')
    }

    const existingWordSet = await this.database.wordSet.findUnique({ where: { id: wordSetId } })
    if (!existingWordSet) {
      throw new HttpError(404, 'WORD_SET_NOT_FOUND', 'Word set was not found')
    }

    const dictionaryResult = await this.dictionarySearch(word)
    if (!dictionaryResult) {
      throw new HttpError(404, 'WORD_NOT_FOUND', 'Word was not found')
    }

    return this.database.$transaction(async (transaction) => {
      const wordSet = await transaction.wordSet.findUnique({ where: { id: wordSetId } })
      if (!wordSet) {
        throw new HttpError(404, 'WORD_SET_NOT_FOUND', 'Word set was not found')
      }

      const savedWord = await transaction.word.upsert({
        where: { normalizedWord: word },
        update: {
          word: dictionaryResult.word,
          phonetic: dictionaryResult.phonetic,
          audioUrl: dictionaryResult.audioUrl,
        },
        create: {
          word: dictionaryResult.word,
          normalizedWord: word,
          phonetic: dictionaryResult.phonetic,
          audioUrl: dictionaryResult.audioUrl,
        },
      })

      await transaction.wordDefinition.deleteMany({ where: { wordId: savedWord.id } })
      const definitions = dictionaryResult.meanings.flatMap((meaning) => {
        const translations = meaning.vietnamese.length > 0 ? meaning.vietnamese : ['']

        return translations.map((vietnameseMeaning) => ({
          wordId: savedWord.id,
          partOfSpeech: meaning.partOfSpeech,
          vietnameseMeaning,
          englishExample: meaning.examples.join('\n') || null,
          source: dictionaryResult.source,
        }))
      })

      if (definitions.length > 0) {
        await transaction.wordDefinition.createMany({ data: definitions })
      }

      const existingFlashcard = await transaction.flashcard.findUnique({
        where: {
          wordId_wordSetId: {
            wordId: savedWord.id,
            wordSetId,
          },
        },
      })

      if (existingFlashcard) {
        return { word: savedWord, flashcard: existingFlashcard, created: false }
      }

      const flashcard = await transaction.flashcard.create({
        data: {
          wordId: savedWord.id,
          wordSetId,
        },
      })

      return { word: savedWord, flashcard, created: true }
    })
  }
}
