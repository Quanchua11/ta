import { describe, expect, it, vi } from 'vitest'
import { DictionaryService } from './dictionary.service.js'

const result = {
  word: 'hello',
  phonetic: null,
  meanings: [],
  audioUrl: null,
  source: 'test',
}

describe('DictionaryService', () => {
  it('normalizes the query before calling the provider', async () => {
    const provider = { search: vi.fn().mockResolvedValue(result) }
    const service = new DictionaryService(provider)

    await service.search('  HELLO  ')

    expect(provider.search).toHaveBeenCalledWith('hello')
  })

  it('returns a cached result without calling the provider', async () => {
    const provider = { search: vi.fn() }
    const repository = {
      findByNormalizedWord: vi.fn().mockResolvedValue(result),
      save: vi.fn(),
    }
    const service = new DictionaryService(provider, undefined, repository)

    await expect(service.search('hello')).resolves.toEqual(result)
    expect(provider.search).not.toHaveBeenCalled()
  })
})
