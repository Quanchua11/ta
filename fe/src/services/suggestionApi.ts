import { request } from './api'

export function suggestWords(prefix: string) {
  return request<{ suggestions: string[] }>(`/api/dictionary/suggestions?prefix=${encodeURIComponent(prefix)}`)
}
