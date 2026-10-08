import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { WordSetService } from '../services/word-set.service.js'

const wordSetService = new WordSetService(prisma)

export const wordSetRouter = Router()
const createSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).optional(),
})
const updateSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
})

wordSetRouter.get('/', async (_request, response, next) => {
  try {
    response.json(await wordSetService.list())
  } catch (error) {
    next(error)
  }
})

wordSetRouter.post('/', async (request, response, next) => {
  try {
    const parsed = createSchema.safeParse(request.body)
    if (!parsed.success) {
      response.status(400).json({
        error: { code: 'INVALID_WORD_SET', message: 'Invalid word set data' },
      })
      return
    }
    response.status(201).json(await wordSetService.create(parsed.data.name, parsed.data.description))
  } catch (error) {
    next(error)
  }
})

wordSetRouter.get('/:id', async (request, response, next) => {
  try {
    response.json(await wordSetService.getById(request.params.id))
  } catch (error) {
    next(error)
  }
})

wordSetRouter.patch('/:id', async (request, response, next) => {
  try {
    const parsed = updateSchema.safeParse(request.body)
    if (!parsed.success) {
      response.status(400).json({
        error: { code: 'INVALID_WORD_SET', message: 'Invalid word set data' },
      })
      return
    }
    response.json(await wordSetService.update(request.params.id, parsed.data))
  } catch (error) {
    next(error)
  }
})

wordSetRouter.delete('/:id', async (request, response, next) => {
  try {
    await wordSetService.delete(request.params.id)
    response.status(204).send()
  } catch (error) {
    next(error)
  }
})
