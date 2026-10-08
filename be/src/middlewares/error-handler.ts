import type { ErrorRequestHandler } from 'express'
import { HttpError } from '../errors/http-error.js'

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next
  console.error(error)

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: { code: error.code, message: error.message },
    })
    return
  }

  if (error instanceof SyntaxError) {
    response.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' },
    })
    return
  }

  response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected server error occurred',
    },
  })
}
