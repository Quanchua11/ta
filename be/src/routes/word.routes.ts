import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { TracauProvider } from '../providers/tracau.provider.js'
import { DictionaryService } from '../services/dictionary.service.js'
import { WordService } from '../services/word.service.js'

const dictionaryService = new DictionaryService(
  new TracauProvider(),
)
const wordService = new WordService(prisma, (word) => dictionaryService.search(word))

export const wordRouter = Router()
const wordSchema = z.object({
  word: z.string().trim().min(1).max(100),
  wordSetId: z.string().trim().min(1),
})

wordRouter.post('/', async (request, response, next) => {
  try {
    const parsed = wordSchema.safeParse(request.body)
    if (!parsed.success) {
      response.status(400).json({
        error: { code: 'INVALID_WORD', message: 'word and wordSetId are required' },
      })
      return
    }

    const result = await wordService.saveWord(parsed.data.word, parsed.data.wordSetId)
    response.status(result.created ? 201 : 200).json(result)
  } catch (error) {
    next(error)
  }
})
