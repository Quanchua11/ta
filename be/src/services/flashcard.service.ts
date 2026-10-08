import type { PrismaClient } from '@prisma/client'
import { HttpError } from '../errors/http-error.js'

export const reviewResults = ['again', 'hard', 'good', 'easy'] as const
export type ReviewResult = (typeof reviewResults)[number]

export class FlashcardService {
  constructor(private readonly database: PrismaClient) {}

  async list(wordSetId: string) {
    await this.ensureWordSet(wordSetId)

    return this.database.flashcard.findMany({
      where: { wordSetId },
      include: { word: { include: { definitions: true } } },
      orderBy: [{ nextReviewAt: 'asc' }, { createdAt: 'desc' }],
    })
  }

  async next(wordSetId: string) {
    await this.ensureWordSet(wordSetId)

    return this.database.flashcard.findFirst({
      where: {
        wordSetId,
        OR: [{ nextReviewAt: null }, { nextReviewAt: { lte: new Date() } }],
      },
      include: { word: { include: { definitions: true } } },
      orderBy: [{ nextReviewAt: 'asc' }, { createdAt: 'asc' }],
    })
  }

  async review(id: string, result: ReviewResult) {
    const flashcard = await this.database.flashcard.findUnique({ where: { id } })
    if (!flashcard) {
      throw new HttpError(404, 'FLASHCARD_NOT_FOUND', 'Flashcard was not found')
    }

    const nextReviewAt = this.nextReviewAt(result)
    const isCorrect = result === 'good' || result === 'easy'

    return this.database.$transaction(async (transaction) => {
      const updatedFlashcard = await transaction.flashcard.update({
        where: { id },
        data: {
          status: result,
          nextReviewAt,
          correctCount: isCorrect ? { increment: 1 } : undefined,
          wrongCount: result === 'again' ? { increment: 1 } : undefined,
        },
        include: { word: { include: { definitions: true } } },
      })

      await transaction.reviewLog.create({
        data: { flashcardId: id, result },
      })

      return updatedFlashcard
    })
  }

  private async ensureWordSet(wordSetId: string) {
    const wordSet = await this.database.wordSet.findUnique({ where: { id: wordSetId } })
    if (!wordSet) {
      throw new HttpError(404, 'WORD_SET_NOT_FOUND', 'Word set was not found')
    }
  }

  private nextReviewAt(result: ReviewResult): Date {
    const days = { again: 0, hard: 1, good: 3, easy: 7 }[result]
    const nextReviewAt = new Date()
    nextReviewAt.setDate(nextReviewAt.getDate() + days)
    return nextReviewAt
  }
}
