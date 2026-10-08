import { Router } from 'express'
import { z } from 'zod'
import { TracauProvider } from '../providers/tracau.provider.js'
import { DictionaryService } from '../services/dictionary.service.js'

const dictionaryService = new DictionaryService(
  new TracauProvider(),
)
const tracauProvider = new TracauProvider()

export const dictionaryRouter = Router()
const querySchema = z.object({ word: z.string().trim().min(1).max(100) })
const suggestionSchema = z.object({ prefix: z.string().trim().min(1).max(30) })

dictionaryRouter.get('/suggestions', async (request, response, next) => {
  const parsed = suggestionSchema.safeParse(request.query)
  if (!parsed.success) {
    response.json({ suggestions: [] })
    return
  }

  try {
    response.json({ suggestions: await tracauProvider.suggestions(parsed.data.prefix) })
  } catch (error) {
    next(error)
  }
})

dictionaryRouter.get('/search', async (request, response, next) => {
  const parsed = querySchema.safeParse(request.query)
  if (!parsed.success) {
    response.status(400).json({
      error: { code: 'INVALID_WORD', message: 'Query word must be 1 to 100 characters' },
    })
    return
  }

  try {
    const result = await dictionaryService.search(parsed.data.word)

    if (!result) {
      response.status(404).json({
        error: { code: 'WORD_NOT_FOUND', message: 'Word was not found' },
      })
      return
    }

    response.json(result)
  } catch (error) {
    next(error)
  }
})
