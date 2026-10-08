import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { env } from './config/env.js'
import { errorHandler } from './middlewares/error-handler.js'
import { notFoundHandler } from './middlewares/not-found.js'
import { requestLogger } from './middlewares/request-logger.js'
import { dictionaryRouter } from './routes/dictionary.routes.js'
import { healthRouter } from './routes/health.routes.js'
import { wordRouter } from './routes/word.routes.js'
import { wordSetRouter } from './routes/word-set.routes.js'
import { flashcardRouter, wordSetFlashcardRouter } from './routes/flashcard.routes.js'

export const app = express()
// Render forwards the original client IP through one trusted proxy.
app.set('trust proxy', 1)

const dictionaryRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: { code: 'RATE_LIMITED', message: 'Too many dictionary requests' },
  },
})

app.use(cors({ origin: env.frontendUrl }))
app.use(express.json())
app.use(requestLogger)

app.use('/health', healthRouter)
app.use('/api/dictionary', dictionaryRateLimit, dictionaryRouter)
app.use('/api/words', wordRouter)
app.use('/api/word-sets', wordSetRouter)
app.use('/api/word-sets/:id/flashcards', wordSetFlashcardRouter)
app.use('/api/flashcards', flashcardRouter)

app.use(notFoundHandler)
app.use(errorHandler)
