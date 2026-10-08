import type { PrismaClient } from '@prisma/client'
import { HttpError } from '../errors/http-error.js'

export class WordSetService {
  constructor(private readonly database: PrismaClient) {}

  list() {
    return this.database.wordSet.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { flashcards: true } } },
    })
  }

  async create(nameValue: unknown, descriptionValue: unknown) {
    const name = typeof nameValue === 'string' ? nameValue.trim() : ''
    const description =
      typeof descriptionValue === 'string' ? descriptionValue.trim() : null

    if (!name || name.length > 150) {
      throw new HttpError(400, 'INVALID_WORD_SET', 'Name is required and must be 150 characters or less')
    }

    if (description && description.length > 2000) {
      throw new HttpError(400, 'INVALID_WORD_SET', 'Description must be 2000 characters or less')
    }

    return this.database.wordSet.create({
      data: { name, description },
      include: { _count: { select: { flashcards: true } } },
    })
  }

  async getById(id: string) {
    const wordSet = await this.database.wordSet.findUnique({
      where: { id },
      include: {
        flashcards: {
          include: { word: { include: { definitions: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!wordSet) {
      throw new HttpError(404, 'WORD_SET_NOT_FOUND', 'Word set was not found')
    }

    return wordSet
  }

  async update(id: string, body: { name?: unknown; description?: unknown }) {
    const data: { name?: string; description?: string | null } = {}

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 150) {
        throw new HttpError(400, 'INVALID_WORD_SET', 'Name must be 150 characters or less')
      }
      data.name = body.name.trim()
    }

    if (body.description !== undefined) {
      if (body.description !== null && typeof body.description !== 'string') {
        throw new HttpError(400, 'INVALID_WORD_SET', 'Description must be text or null')
      }
      if (typeof body.description === 'string' && body.description.trim().length > 2000) {
        throw new HttpError(400, 'INVALID_WORD_SET', 'Description must be 2000 characters or less')
      }
      data.description = typeof body.description === 'string' ? body.description.trim() : null
    }

    try {
      return await this.database.wordSet.update({
        where: { id },
        data,
        include: { _count: { select: { flashcards: true } } },
      })
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new HttpError(404, 'WORD_SET_NOT_FOUND', 'Word set was not found')
      }
      throw error
    }
  }

  async delete(id: string) {
    try {
      await this.database.wordSet.delete({ where: { id } })
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new HttpError(404, 'WORD_SET_NOT_FOUND', 'Word set was not found')
      }
      throw error
    }
  }

  private isNotFoundError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025'
  }
}
