import { constants } from '../../config/constants'
import { Logger } from '../../logger'
import { BotCaster } from '../../services/botCaster'
import { FilmParams, Translator } from '../../types/hdrezka'
import { CastController } from './castController'
import axios, { AxiosResponse } from 'axios'

export class FilmCastController extends CastController {
  private params!: FilmParams

  readonly BUTTONS = [
    this.CAST_STAGE_NAME,
    this.STOP_STAGE_NAME,
    this.PLAY_STAGE_NAME,
    this.PAUSE_STAGE_NAME,
    this.QUALITY_STAGE_NAME,
    this.TRANSLATOR_STAGE_NAME
  ]

  async parseMessage(): Promise<boolean> {
    try {
      this.params = this.getParamsFromUrl()
      const pageHtml = await this.getPageHtml()
      this.translators = this.getTranslators(pageHtml)
      this.pageInfo = this.getPageInfo(pageHtml)
      this.setSubStage(this.TRANSLATOR_STAGE_NAME)
      this.setText('Choose a translator.')

      this.caster = BotCaster.getInstance()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'RezkaSeriesCastController Unknown error'
      this.setText(msg)
      Logger.error(msg, { data: error })
      return false
    }

    return true
  }

  getParamsFromUrl(): FilmParams {
    const url = this.url

    const params: FilmParams = { id: 0 }

    const idMatches = url.match(/\/(\d+)-.+\.html/)
    if (!idMatches || !idMatches[1]) throw new Error('Cant parse id from url.')
    params.id = parseInt(idMatches[1])

    return params
  }

  refreshInfo(): void {
    let filmInfo =
      `<b><a href="${this.url}">${this.pageInfo.name}</a></b>\n\n` +
      `Translator - <b>${this.translator.name}</b>\n` +
      `Quality - <b>${this.quality}</b>`

    const subtitleTrackName = this.getSubtitlesTrackName()
    if (this.series.subtitles[subtitleTrackName]) {
      filmInfo += `\nSubtitle - <b>${subtitleTrackName}</b>`
    }

    this.info = filmInfo
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
      if (cast) this.setText('Cast started')

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

    return false
  }

  async processTranslator(name: string): Promise<boolean> {
    if (this.isCancelButtonPress(name)) {
      this.processCancelButtonPress()
    }

    const findTranslator = this.findTranslatorByName(name)
    if (findTranslator) {
      const filmEncoded = await this.getFilmEncodedByTranslator(findTranslator)
      const film = this.decode(filmEncoded)

      this.setTranslator(findTranslator)
      this.setSeries(film)

      const stop = await this.stop()
      const cast = await this.cast()
      const isOk = stop && cast

      if (isOk) {
        this.clearSubStage()
        this.showBackButton()
        this.refreshInfo()
        this.setTextWithInfoAndPhoto()
      }

      return isOk
    }

    return false
  }

  async getFilmEncodedByTranslator(translator: Translator): Promise<unknown> {
    const response: AxiosResponse = await axios.post(
      `${constants.REZKA.AJAX_BASE_URL}${constants.REZKA.AJAX_SERIES_URL}`,
      {
        id: this.params.id,
        translator_id: translator.id,
        is_camrip: translator.camrip,
        is_ads: translator.ads,
        is_director: translator.director,
        action: 'get_movie'
      },
      {
        headers: {
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    if (response.status !== 200 || !response.data.url)
      throw new Error('Film encoded url are empty.')

    return response.data
  }
}
