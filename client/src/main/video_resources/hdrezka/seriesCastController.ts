import { constants } from '../../config/constants'
import { Logger } from '../../logger'
import { BotCaster } from '../../services/botCaster'
import { AssociativeArray } from '../../types'
import { DecodedSeries, SeriesParams } from '../../types/hdrezka'
import { CastController } from './castController'
import axios, { AxiosResponse } from 'axios'
import HTMLParser from 'node-html-parser'

export class SeriesCastController extends CastController {
  private params: SeriesParams = {
    id: 0,
    translator_id: 0,
    season: 0,
    episode: 0
  }

  subtitlesTrackName = 'English'

  private totalSeasons!: number
  private totalEpisodes: AssociativeArray<number> = {}

  private CAST_NEXT_STAGE_NAME = 'CastNext'
  private CAST_PREV_STAGE_NAME = 'CastPrev'
  readonly BUTTONS = [
    this.CAST_STAGE_NAME,
    this.STOP_STAGE_NAME,
    this.PLAY_STAGE_NAME,
    this.CAST_PREV_STAGE_NAME,
    this.CAST_NEXT_STAGE_NAME,
    this.PAUSE_STAGE_NAME,
    this.QUALITY_STAGE_NAME,
    this.TRANSLATOR_STAGE_NAME
  ]

  async parseMessage(): Promise<boolean> {
    try {
      const params = this.getParamsFromUrl()
      const seriesEncoded = await this.getSeriesEncodedByParams(params)

      if (!seriesEncoded) {
        this.setText('Can`t find series.')
        return false
      }

      this.setParams(params)
      await this.setTotalSeriesInfoByParams(params)
      const pageHtml = await this.getPageHtml()
      this.translators = this.getTranslators(pageHtml)
      this.pageInfo = this.getPageInfo(pageHtml)
      const currentTranslator = this.findTranslatorById(params.translator_id)
      if (!currentTranslator) {
        this.setText('Can`t find translator.')
        return false
      }
      this.setTranslator(currentTranslator)

      const series = this.decode(seriesEncoded)
      this.setSeries(series)

      this.setTextWithInfoAndPhoto()

      this.caster = BotCaster.getInstance()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'RezkaSeriesCastController Unknown error'
      this.setText(msg)
      Logger.error(msg, { data: error })
      return false
    }
    return true
  }

  getParamsFromUrl(): SeriesParams {
    const url = this.url

    const params: SeriesParams = {
      id: 0,
      translator_id: 0,
      season: 0,
      episode: 0
    }

    const idMatches = url.match(/\/(\d+)-.+\.html/)
    if (!idMatches || !idMatches[1]) throw new Error('Cant parse id from url.')
    params.id = parseInt(idMatches[1])

    const tidMatches = url.match(/t:(\d+)/)
    if (!tidMatches || !tidMatches[1]) throw new Error('Cant parse translator_id from url.')
    params.translator_id = parseInt(tidMatches[1])

    const seasonMatches = url.match(/s:(\d+)/)
    if (!seasonMatches || !seasonMatches[1]) throw new Error('Cant parse season from url.')
    params.season = parseInt(seasonMatches[1])

    const episodeMatches = url.match(/e:(\d+)/)
    if (!episodeMatches || !episodeMatches[1]) throw new Error('Cant parse episode from url.')
    params.episode = parseInt(episodeMatches[1])

    return params
  }

  refreshInfo(): void {
    const params = this.getParams()
    let seriesInfo =
      `<b><a href="${this.url}">${this.pageInfo.name}</a></b>\n\n` +
      `Season - <b>${params.season}</b>\n` +
      `Episode - <b>${params.episode}</b>\n` +
      `Translator - <b>${this.translator.name}</b>\n` +
      `Quality - <b>${this.quality}</b>\n\n` +
      `Total seasons - <b>${this.totalSeasons}</b>\n` +
      `Total episodes in this season - <b>${this.totalEpisodes[params.season]}</b>`

    const subtitleTrackName = this.getSubtitlesTrackName()
    if (this.series.subtitles[subtitleTrackName]) {
      seriesInfo += `\n\nSubtitle - <b>${subtitleTrackName}</b>`
    }

    this.info = seriesInfo
  }

  async processControllerButtonAction(botMsg: string): Promise<boolean> {
    this.setText('')

    if (this.isSubtitlesTrackSubstage()) {
      return this.processSubtitleTrack(botMsg)
    }
    if (botMsg === this.SUBTITLES_TRACK_STAGE_NAME) {
      this.setSubStage(this.SUBTITLES_TRACK_STAGE_NAME)
      this.setText('Change subtitle track.')
      return true
    }
    if (this.isTranslatorSubstage()) {
      return await this.processTranslator(botMsg)
    }
    if (botMsg === this.TRANSLATOR_STAGE_NAME) {
      this.setSubStage(this.TRANSLATOR_STAGE_NAME)
      this.setText('Change translator.')
      return true
    }
    if (this.isSubtitleSubstage()) {
      return this.changeSubtitles(botMsg)
    }
    if (botMsg === this.SUBTITLES_STAGE_NAME) {
      this.setSubStage(this.SUBTITLES_STAGE_NAME)
      this.setText('Change subtitles options.')
      return true
    }
    if (this.isQualitySubstage()) {
      return this.setQuality(botMsg)
    }
    if (botMsg === this.QUALITY_STAGE_NAME) {
      this.setSubStage(this.QUALITY_STAGE_NAME)
      this.setText('Change video quality.')

      return true
    }
    if (botMsg === this.CAST_STAGE_NAME) {
      const cast = await this.cast()
      if (cast) this.setText('Cast started.')

      return cast
    }
    if (botMsg === this.STOP_STAGE_NAME) {
      const stop = await this.stop()
      if (stop) this.setText('Cast stopped.')

      return stop
    }
    if (botMsg === this.PLAY_STAGE_NAME) {
      const play = await this.play()
      if (play) this.setText('Cast resumed.')

      return play
    }
    if (botMsg === this.PAUSE_STAGE_NAME) {
      const pause = await this.pause()
      if (pause) this.setText('Cast paused.')

      return pause
    }
    if (botMsg === this.CAST_NEXT_STAGE_NAME) {
      const castNext = await this.castNext()

      if (castNext) this.setTextWithInfoAndPhoto('Cast started.')

      return castNext
    }
    if (botMsg === this.CAST_PREV_STAGE_NAME) {
      const castPrev = await this.castPrev()

      if (castPrev) this.setTextWithInfoAndPhoto('Cast started.')

      return castPrev
    }

    return false
  }

  async processTranslator(name: string): Promise<boolean> {
    if (this.isCancelButtonPress(name)) {
      this.processCancelButtonPress()
    }

    const findTranslator = this.findTranslatorByName(name)
    if (findTranslator) {
      const params = this.getParams()
      params.translator_id = findTranslator.id
      this.setParams(params)

      const seriesEncoded = await this.getSeriesEncodedByParams(params)
      this.setText('Can`t find series.')
      if (!seriesEncoded) return false

      const series = this.decode(seriesEncoded)

      this.setSeries(series)
      this.setTranslator(findTranslator)

      const stop = await this.stop()
      const cast = await this.cast()
      const isOk = stop && cast

      if (isOk) {
        this.showBackButton()
        this.clearSubStage()
        this.refreshInfo()
        this.setTextWithInfoAndPhoto()
      }

      return isOk
    }

    return false
  }

  async castNext(): Promise<boolean> {
    const params = this.getParams()

    ;[params.episode, params.season] = this.calcNextEpisodeAndSeasonNumber(
      params.episode as number,
      params.season as number
    )

    this.setParams(params)
    const series = await this.getSeriesByParams(params)
    this.setSeries(series)

    const stop = await this.stop()
    const cast = await this.cast()
    const isOk = stop && cast

    return isOk
  }

  async castPrev(): Promise<boolean> {
    const params = this.getParams()

    ;[params.episode, params.season] = this.calcPrevEpisodeAndSeasonNumber(
      params.episode as number,
      params.season as number
    )

    this.setParams(params)
    const series = await this.getSeriesByParams(params)
    this.setSeries(series)

    const stop = await this.stop()
    const cast = await this.cast()
    const isOk = stop && cast

    return isOk
  }

  async getSeriesEncodedByParams(params: SeriesParams): Promise<unknown> {
    const response: AxiosResponse = await axios.post(
      `${constants.REZKA.AJAX_BASE_URL}${constants.REZKA.AJAX_SERIES_URL}`,
      {
        id: params.id,
        translator_id: params.translator_id,
        season: params.season,
        episode: params.episode,
        //action: 'get_stream',
        action: 'get_episodes'
      },
      {
        headers: {
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Accept-Encoding': 'gzip, deflate, br',
          //"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    if (response.status !== 200 || !response.data.url) {
      return false
    }

    return response.data
  }

  async setTotalSeriesInfoByParams(params: SeriesParams): Promise<void> {
    const data = await axios
      .post(
        `${constants.REZKA.AJAX_BASE_URL}${constants.REZKA.AJAX_SERIES_URL}`,
        {
          id: params.id,
          translator_id: params.translator_id,
          action: 'get_episodes'
        },
        {
          headers: {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate, br',
            //"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      .then((res) => {
        if (res.status !== 200 || !res.data.episodes)
          throw new Error('Get total episodes error(empty result).')

        return res.data
      })
      .catch((error) => new Error(error.message))

    const episodesHtml = HTMLParser.parse(data.episodes)
    const seasonsHtml = HTMLParser.parse(data.seasons)

    if (!seasonsHtml) throw new Error('Empty seasons count.')
    if (!episodesHtml) throw new Error('Empty episodes count.')

    this.totalSeasons = seasonsHtml.querySelectorAll('li').length
    for (let i = 1; i <= this.totalSeasons; i++) {
      this.totalEpisodes[i] = episodesHtml.querySelectorAll(
        `ul#simple-episodes-list-${i} li`
      ).length
    }
  }

  async getSeriesByParams(params: SeriesParams): Promise<DecodedSeries> {
    const encoded = await this.getSeriesEncodedByParams(params)
    return this.decode(encoded)
  }

  setParams(params: SeriesParams): void {
    this.params.id = params.id
    this.params.season = params.season
    this.params.translator_id = params.translator_id
    this.params.episode = params.episode
  }

  getParams(): SeriesParams {
    return this.params
  }

  calcPrevEpisodeAndSeasonNumber(episode: number, season: number): number[] {
    if (episode > 1) return [--episode, season]

    if (episode === 1 && season > 1) return [this.totalEpisodes[season - 1], --season]

    throw new Error(`This was first episode(. Season ${season}, episode ${episode}.`)
  }

  calcNextEpisodeAndSeasonNumber(episode: number, season: number): number[] {
    if (episode < this.totalEpisodes[season]) return [++episode, season]

    if (episode === this.totalEpisodes[season] && season < this.totalSeasons) return [1, ++season]

    throw new Error(`This was last episode(. Season ${season}, episode ${episode}.`)
  }

  getSeries(): DecodedSeries {
    return this.series
  }
}
