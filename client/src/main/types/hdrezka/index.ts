import { AssociativeArray } from '..'

export type SeriesParams = {
  id: number
  translator_id: number
  season: number
  episode: number
}

export type PageInfo = {
  name: string
  img: string
}

export type FilmParams = { id: number }

export type Translator = {
  id: number
  name: string
  camrip: number
  ads: number
  director: number
}

export type EpisodesResult = {
  episodes: string
  seasons: string
}

export type StreamResult = {
  success: boolean
  message: string
  url: string
  quality: string
  subtitle: string
  subtitle_lns: object
  subtitle_def: string
  thumbnails: string
}

export type DecodedSeries = {
  videos: AssociativeArray<string[]>
  subtitles: AssociativeArray<string>
}
