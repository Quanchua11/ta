import { afterEach, describe, expect, it, vi } from 'vitest'
import { TracauProvider } from './tracau.provider.js'

afterEach(() => vi.unstubAllGlobals())

describe('TracauProvider', () => {
  it('extracts dictionary meanings separately from two bilingual examples', async () => {
    const rows = '<tr id="tl"><td>danh từ</td></tr><tr id="mn"><td>địa chỉ</td></tr>'
      + '<tr id="mh"><td>What is your address?</td></tr><tr id="mh_n"><td>Địa chỉ của bạn là gì?</td></tr>'.repeat(3)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      sentences: [{ fields: { en: 'A long unrelated sentence', vi: 'Bản dịch câu, không phải nghĩa từ' } }],
      tratu: [{ fields: { word: 'address', fulltext: `<article id="dict_ev"><table>${rows}</table></article>` } }],
    }))))
    const result = await new TracauProvider().search('address')
    expect(result?.meanings[0].vietnamese).toEqual(['địa chỉ'])
    expect(result?.meanings[0].examples).toHaveLength(2)
    expect(result?.meanings[0].examples[0]).toContain('Địa chỉ của bạn là gì?')
  })

  it('uses Tracau autocomplete entries rather than words extracted from sentences', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      tratu: [{ fields: { word: 'address' } }, { fields: { word: 'address book' } }, { fields: { word: 'other' } }],
    })))
    vi.stubGlobal('fetch', fetchMock)
    expect(await new TracauProvider().suggestions('addr')).toEqual(['address', 'address book'])
    expect(fetchMock.mock.calls[0][0]).toContain('/a/e/addr')
  })

  it('returns null for an empty result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"sentences":[],"tratu":[]}')))
    expect(await new TracauProvider().search('abadon')).toBeNull()
  })
})
