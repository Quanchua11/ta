import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { HttpError } from '../errors/http-error.js'
import { FlashcardService, reviewResults } from '../services/flashcard.service.js'

const flashcardService = new FlashcardService(prisma)
const reviewSchema = z.object({ result: z.enum(reviewResults) })

export const wordSetFlashcardRouter = Router({ mergeParams: true })
wordSetFlashcardRouter.get('/', async (request, response, next) => {
  try {
    const wordSetId = (request.params as { id: string }).id
    response.json(await flashcardService.list(wordSetId))
  } catch (error) {
    next(error)
  }
})

wordSetFlashcardRouter.get('/next', async (request, response, next) => {
  try {
    const wordSetId = (request.params as { id: string }).id
    const flashcard = await flashcardService.next(wordSetId)
    if (!flashcard) {
      response.status(404).json({
        error: { code: 'NO_FLASHCARD_DUE', message: 'No flashcard is due for review' },
      })
      return
    }
    response.json(flashcard)
  } catch (error) {
    next(error)
  }
})

export const flashcardRouter = Router()
flashcardRouter.post('/:id/review', async (request, response, next) => {
  try {
    const parsed = reviewSchema.safeParse(request.body)
    if (!parsed.success) {
      throw new HttpError(400, 'INVALID_REVIEW_RESULT', 'Result must be again, hard, good, or easy')
    }
    response.json(await flashcardService.review(request.params.id, parsed.data.result))
  } catch (error) {
    next(error)
  }
})
