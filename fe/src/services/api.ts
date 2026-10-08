const productionApiUrl = 'https://ta-5su2.onrender.com'
const apiUrl = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : productionApiUrl)).replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface ErrorResponse {
  error?: { code?: string; message?: string }
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: {
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    })
  } catch {
    throw new ApiError('Không kết nối được backend. Hãy chạy `pnpm dev` trong thư mục be.', 0, 'NETWORK_ERROR')
  }

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ErrorResponse | null
    throw new ApiError(
      error?.error?.message ?? 'Có lỗi xảy ra khi gọi API',
      response.status,
      error?.error?.code,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function jsonBody(body: unknown): RequestInit {
  return {
    method: 'POST',
    body: JSON.stringify(body),
  }
}
