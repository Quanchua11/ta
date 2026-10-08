import type { DictionaryProvider, DictionaryResult } from '../types/dictionary.js'
import { load } from 'cheerio'
import { HttpError } from '../errors/http-error.js'

interface TracauSentence {
  fields?: {
    en?: unknown
    vi?: unknown
  }
}

interface TracauResponse {
  language?: unknown
  sentences?: TracauSentence[]
  tratu?: Array<{ fields?: { word?: string; fulltext?: string } }>
}

export class TracauProvider implements DictionaryProvider {
  private readonly apiKey: string

  constructor(apiKey = process.env.TRACAU_API_KEY ?? 'WBBcwnwQpV89') {
    this.apiKey = apiKey.trim() || 'WBBcwnwQpV89'
  }

  async search(word: string): Promise<DictionaryResult | null> {
    const data = await this.fetchResult(word)
    if (!data) return null
    const sentences = (data.sentences ?? [])
      .map((sentence) => ({
        english: this.stripTags(sentence.fields?.en),
        vietnamese: this.stripTags(sentence.fields?.vi),
      }))
      .filter(
        (sentence): sentence is { english: string; vietnamese: string } =>
          Boolean(sentence.english && sentence.vietnamese),
      )

    const entry = data.tratu?.find((item) => item.fields?.word?.toLowerCase() === word.toLowerCase())
    const $ = load(entry?.fields?.fulltext ?? '')
    const meanings: DictionaryResult['meanings'] = []
    let partOfSpeech = 'Nghĩa tiếng Việt'
    const examples: string[] = []
    let englishExample = ''

    // Tracau's English-Vietnamese dictionary distinguishes meanings from example translations.
    $('#dict_ev tr').each((_index, row) => {
      const kind = $(row).attr('id')
      const text = $(row).find('td').last().text().replace(/\s+/g, ' ').trim()
      if (!text) return
      if (kind === 'tl') partOfSpeech = text
      if (kind === 'mn') {
        let meaning = meanings.find((item) => item.partOfSpeech === partOfSpeech)
        if (!meaning) {
          meaning = { partOfSpeech, vietnamese: [], examples: [] }
          meanings.push(meaning)
        }
        if (!meaning.vietnamese.includes(text)) meaning.vietnamese.push(text)
      }
      if (kind === 'mh') englishExample = text
      if (kind === 'mh_n' && englishExample && examples.length < 2) {
        examples.push(`${englishExample}\n${text}`)
        englishExample = ''
      }
    })

    if (meanings.length === 0 && sentences.length === 0) return null
    if (examples.length === 0) {
      examples.push(...sentences
        .filter((sentence) => sentence.english.split(/\s+/).length >= 4)
        .sort((a, b) => a.english.length - b.english.length)
        .slice(0, 2)
        .map((sentence) => `${sentence.english}\n${sentence.vietnamese}`))
    }
    if (meanings.length === 0) {
      meanings.push({ partOfSpeech: 'Mẫu câu song ngữ (chưa có mục từ)', vietnamese: [], examples: [] })
    }
    meanings[0].examples = examples
    const phonetic = $('#dict_ev tr#pa td').last().text().trim() || null

    return {
      word,
      phonetic,
      meanings,
      audioUrl: null,
      source: 'tracau.vn',
    }
  }

  async suggestions(prefix: string): Promise<string[]> {
    const data = await this.fetchResult(prefix, true)
    if (!data) return []

    const normalizedPrefix = prefix.trim().toLowerCase()
    const words = data.tratu
      ?.map((item) => item.fields?.word?.trim())
      .filter((word): word is string => Boolean(word && word.toLowerCase().startsWith(normalizedPrefix)))

    return [...new Set(words ?? [])].slice(0, 8)
  }

  private async fetchResult(value: string, autocomplete = false): Promise<TracauResponse | null> {
    try {
      const path = autocomplete ? `a/e/${encodeURIComponent(value)}` : `s/${encodeURIComponent(value)}/en`
      const response = await fetch(`https://api.tracau.vn/${this.apiKey}/${path}`, {
        signal: AbortSignal.timeout(10_000),
      })
      if (response.status === 404) return null
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return (await response.json()) as TracauResponse
    } catch {
      throw new HttpError(502, 'TRACAU_UNAVAILABLE', 'Không kết nối được Tracau. Vui lòng thử lại sau.')
    }
  }

  private stripTags(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null
    }

    return value.replace(/<[^>]*>/g, '').trim() || null
  }
}
