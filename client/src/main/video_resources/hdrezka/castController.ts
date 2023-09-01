import { constants } from '../../config/constants'
import { StageController } from '../../interfaces/stageController.interface'
import { BotCaster } from '../../services/botCaster'
import { AssociativeArray } from '../../types'
import { DecodedSeries, PageInfo, Translator } from '../../types/hdrezka'
import { UrlDecoder } from './urlDecoder'
import axios from 'axios'
import HTMLParser from 'node-html-parser'
import { HTMLElement as HTMLElementNode } from 'node-html-parser'

export abstract class CastController implements StageController {
  protected pageInfo!: PageInfo
  protected translators!: AssociativeArray<Translator>
  protected translator: Translator = {
    id: 0,
    name: '',
    camrip: 0,
    ads: 0,
    director: 0
  }
  protected series!: DecodedSeries
  protected caster!: BotCaster

  readonly DEFAULT_QUALITY = '720p'
  protected quality = ''
  protected availableQualities: string[] = []

  protected subtitlesTrackName = ''
  protected allowSubtitlesTrackNames = ['english', 'українська', 'русский']

  protected backButton = true

  protected text = ''
  protected info = ''
  protected sendPhoto = false

  readonly SUBTITLES_FONT_SCALE_DEFAULT = constants.CAST.SUBTITLES_FONT_SCALE_DEFAULT
  subtitlesFontScale = this.SUBTITLES_FONT_SCALE_DEFAULT

  protected subStage = ''
  protected CAST_STAGE_NAME = 'Cast'
  protected STOP_STAGE_NAME = 'Stop'
  protected PLAY_STAGE_NAME = 'Play'
  protected PAUSE_STAGE_NAME = 'Pause'
  protected QUALITY_STAGE_NAME = 'Quality'
  protected TRANSLATOR_STAGE_NAME = 'Translator'
  protected SUBTITLES_STAGE_NAME = 'Subtitles'
  protected SUBTITLES_TRACK_STAGE_NAME = 'SubtitlesTrack'
  readonly SUB_STAGES = [
    this.TRANSLATOR_STAGE_NAME,
    this.QUALITY_STAGE_NAME,
    this.SUBTITLES_STAGE_NAME,
    this.SUBTITLES_TRACK_STAGE_NAME
  ]
  protected SUBTITLE_OFF_ACTION = 'SubtitleOff'
  protected SUBTITLE_ON_ACTION = 'SubtitleOn'
  protected SUBTITLE_PLUS_ACTION = 'SubtitlePlus'
  protected SUBTITLE_MINUS_ACTION = 'SubtitleMinus'
  protected SUBTITLE_FONT_SIZE_ACTION = 'ResetFontSize'
  readonly SUBTITLE_ACTIONS = [
    this.SUBTITLE_OFF_ACTION,
    this.SUBTITLE_ON_ACTION,
    this.SUBTITLE_PLUS_ACTION,
    this.SUBTITLE_MINUS_ACTION,
    this.SUBTITLE_FONT_SIZE_ACTION,
    this.SUBTITLES_TRACK_STAGE_NAME
  ]
  readonly BUTTONS: string[] = []

  readonly CANCEL_BUTTON_NAME = 'Cancel'
  readonly SUBTITLE_BUTTON_NAME = 'Subtitles'

  constructor(protected url: string) {
    this.url = url
  }

  abstract parseMessage(): Promise<boolean>
  abstract processControllerButtonAction(botMsg: string): Promise<boolean>

  abstract refreshInfo(): void

  decode(encoded: any): DecodedSeries {
    const encodedUrl: string = encoded.url
    const encodedSubtitles: string = encoded.subtitle
    const Decoder: UrlDecoder = new UrlDecoder(encodedUrl)
    const videos: AssociativeArray<string[]> = Decoder.getUrls()

    if (Object.keys(videos).length <= 0) throw new Error('Series url object are empty.')

    const series = {
      videos: videos,
      subtitles: this.getSubtitles(encodedSubtitles)
    }

    return series
  }

  getSubtitles(subtitlesStr: string): AssociativeArray<string> {
    if (!subtitlesStr) return {}

    const urls: string[] = subtitlesStr.split(',')
    const urlsWithLang: AssociativeArray<string> = {}
    for (let i = 0; i < urls.length; i++) {
      const tmp = urls[i]
      const fq = tmp.match(/\[(.+)\]/)

      if (fq === null || !this.isTrackNameAllow(fq[1])) continue

      urlsWithLang[fq[1]] = tmp.replace(fq[0], '')
    }

    return urlsWithLang
  }

  setSeries(film: DecodedSeries): void {
    this.series = film
    this.availableQualities = Object.keys(film.videos)
    this.quality = this.availableQualities.includes(this.DEFAULT_QUALITY)
      ? this.DEFAULT_QUALITY
      : this.availableQualities[0]

    this.refreshInfo()
  }

  getControllerButtons(): string[] {
    if (this.isSubtitlesTrackSubstage()) {
      this.hideBackButton()
      return [...this.getSubtitleTracksNames(), this.CANCEL_BUTTON_NAME]
    }
    if (this.isTranslatorSubstage()) {
      this.hideBackButton()
      return [...this.getTranslatorsNames(), this.CANCEL_BUTTON_NAME]
    }
    if (this.isQualitySubstage()) {
      this.hideBackButton()
      return [...this.getAvailableQualities(), this.CANCEL_BUTTON_NAME]
    }
    if (this.isSubtitleSubstage()) {
      this.hideBackButton()
      return [...this.SUBTITLE_ACTIONS, this.CANCEL_BUTTON_NAME]
    }

    if (this.checkSubtitlesAvailability()) {
      return [...this.BUTTONS, this.SUBTITLE_BUTTON_NAME]
    }

    return this.BUTTONS
  }

  getSubtitleTracksNames(): string[] {
    return Object.keys(this.series.subtitles)
  }

  checkSubtitlesAvailability(): boolean {
    return this.series?.subtitles && Object.keys(this.series.subtitles).length > 0
  }

  async changeSubtitles(action: string): Promise<boolean> {
    if (this.isCancelButtonPress(action)) {
      this.processCancelButtonPress()
    }
    if (action === this.SUBTITLE_OFF_ACTION) {
      const res = await this.subtitleOff()

      this.setText('Subtitle Off.')

      return res
    }
    if (action === this.SUBTITLE_ON_ACTION) {
      const activeTrackIndex = this.getActiveSubtitleIndex()
      if (activeTrackIndex == -1) return false

      const res = await this.subtitleOn(activeTrackIndex)

      this.setText('Subtitle On.')

      return res
    }
    if (action === this.SUBTITLE_PLUS_ACTION) {
      const res = await this.subtitlePlus()

      this.setText('Subtitle font increased.')

      return res
    }
    if (action === this.SUBTITLE_MINUS_ACTION) {
      const res = await this.subtitleMinus()

      this.setText('Subtitle font decreased.')

      return res
    }
    if (action === this.SUBTITLE_FONT_SIZE_ACTION) {
      const res = await this.resetFontSize()

      this.setText('Subtitle font size has been reset.')

      return res
    }

    return false
  }

  async processSubtitleTrack(name: string): Promise<boolean> {
    if (this.isCancelButtonPress(name)) {
      this.processCancelButtonPress()
    }

    if (this.checkSubtitlesAvailability() && Object.keys(this.series.subtitles).includes(name)) {
      this.setSubtitlesTrackName(name)

      const show = await this.caster.showSubtitle(this.getActiveSubtitleIndex())

      if (show) {
        this.showBackButton()
        this.clearSubStage()
        this.refreshInfo()
        this.setText(`Subtitle - <b>${name}</b>`)
      }

      return show
    }

    return false
  }

  setTranslator(translator: Translator): void {
    this.translator.name = translator.name
    this.translator.id = translator.id
    this.translator.director = translator.director
    this.translator.camrip = translator.camrip
    this.translator.ads = translator.ads
  }

  getTranslator(): Translator {
    return this.translator
  }

  getTranslatorsNames(): string[] {
    return Object.entries(this.translators).map(([, value]) => value.name)
  }

  findTranslatorByName(name: string): Translator | undefined {
    return Object.entries(this.translators).find(([, value]) => value.name === name)?.[1]
  }

  findTranslatorById(id: number): Translator | undefined {
    return Object.entries(this.translators).find(([, value]) => value.id === id)?.[1]
  }

  async getPageHtml(): Promise<HTMLElementNode> {
    const data = await axios
      .get(this.url)
      .then((res) => {
        if (res.status !== 200) throw new Error('Get total episodes error(empty result).')

        return res.data
      })
      .catch((error) => new Error(error.message))

    const pageHtml = HTMLParser.parse(data)
    if (!pageHtml) throw new Error('Empty page html.')

    return pageHtml
  }

  getPageInfo(pageHtml: HTMLElementNode): PageInfo {
    const name = pageHtml.querySelector('meta[property="og:title"]')?.getAttribute('content')
    const img = pageHtml.querySelector('meta[property="og:image"]')?.getAttribute('content')

    return { name: name, img: img } as PageInfo
  }

  getTranslators(pageHtml: HTMLElementNode): AssociativeArray<Translator> {
    const translators: AssociativeArray<Translator> = {}
    const translatorsHtml = pageHtml.querySelectorAll('#translators-list li')

    if (translatorsHtml.length === 0) {
      throw new Error('Empty translators html.')
    }

    for (const translatorHtml of translatorsHtml) {
      const translatorId = translatorHtml.getAttribute('data-translator_id')
      if (!translatorId) continue

      const camrip = translatorHtml.getAttribute('data-camrip') || ''
      const ads = translatorHtml.getAttribute('data-ads') || ''
      const director = translatorHtml.getAttribute('data-director') || ''

      translators[translatorId] = {
        id: parseInt(translatorId),
        name: translatorHtml.text.trim(),
        camrip: camrip ? parseInt(camrip) : 0,
        ads: ads ? parseInt(ads) : 0,
        director: director ? parseInt(director) : 0
      }
    }

    return translators
  }

  isCancelButtonPress(action: string): boolean {
    return action === this.CANCEL_BUTTON_NAME
  }

  processCancelButtonPress(): boolean {
    this.clearSubStage()
    this.showBackButton()

    this.setText('')

    return true
  }

  getSubtitlesTrackName(): string {
    return this.subtitlesTrackName
  }

  setSubtitlesTrackName(name: string): void {
    this.subtitlesTrackName = name
  }

  isTrackNameAllow(name: string): boolean {
    return this.allowSubtitlesTrackNames.includes(name.toLowerCase())
  }

  getActiveSubtitleIndex(): number {
    return Object.keys(this.series.subtitles).indexOf(this.getSubtitlesTrackName())
  }

  getSubStage(): string {
    return this.subStage
  }

  setSubStage(state: string): void {
    this.subStage = state
  }

  clearSubStage(): void {
    this.setSubStage('')
  }

  isSubstage(botMsg: string): boolean {
    return this.SUB_STAGES.includes(botMsg)
  }

  isTranslatorSubstage(): boolean {
    return this.getSubStage() === this.TRANSLATOR_STAGE_NAME
  }

  isSubtitlesTrackSubstage(): boolean {
    return this.getSubStage() === this.SUBTITLES_TRACK_STAGE_NAME
  }

  isQualitySubstage(): boolean {
    return this.getSubStage() === this.QUALITY_STAGE_NAME
  }

  isSubtitleSubstage(): boolean {
    return this.getSubStage() === this.SUBTITLES_STAGE_NAME
  }

  getAvailableQualities(): string[] {
    return this.availableQualities
  }

  hideBackButton(): void {
    this.backButton = false
  }

  showBackButton(): void {
    this.backButton = true
  }

  isBackButton(): boolean {
    return this.backButton
  }

  getText(): string {
    return this.text
  }

  getInfo(): string {
    return this.info
  }

  setText(text: string): void {
    this.notSendPhotoWithNextMessage()
    this.text = text
  }

  setTextWithInfo(text = ''): void {
    this.notSendPhotoWithNextMessage()
    this.text = text === '' ? this.getInfo() : text + '\n\n' + this.getInfo()
  }

  setTextWithInfoAndPhoto(text = ''): void {
    this.sendPhotoWithNextMessage()
    this.text = text === '' ? this.getInfo() : text + '\n\n' + this.getInfo()
  }

  notSendPhotoWithNextMessage(): void {
    this.sendPhoto = false
  }

  sendPhotoWithNextMessage(): void {
    this.sendPhoto = true
  }

  isSendPhotoWithNextMessage(): boolean {
    return this.sendPhoto
  }

  castNext(): Promise<boolean> {
    return Promise.resolve(true)
  }

  castPrev(): Promise<boolean> {
    return Promise.resolve(true)
  }

  getPhoto(): string {
    return this.isSendPhotoWithNextMessage() ? this.pageInfo?.img : ''
  }

  async cast(): Promise<boolean> {
    const quality = this.getCurrentQuality()
    const mediaURL = this.series.videos[quality][1]

    return await this.caster.cast(mediaURL, this.series.subtitles, this.getActiveSubtitleIndex())
  }

  async stop(): Promise<boolean> {
    return await this.caster.stopCast()
  }

  async play(): Promise<boolean> {
    return await this.caster.play()
  }

  async pause(): Promise<boolean> {
    return await this.caster.pause()
  }

  async setQuality(quality: string): Promise<boolean> {
    if (this.isCancelButtonPress(quality)) {
      this.processCancelButtonPress()
    }

    const qualities = this.getAvailableQualities()
    if (qualities.includes(quality)) {
      this.setCurrentQuality(quality)
      const stop = await this.stop()
      const cast = await this.cast()
      const isOk = stop && cast

      if (isOk) {
        this.showBackButton()
        this.clearSubStage()
        this.refreshInfo()
        this.setText('Quality has been changed. New quality - ' + quality)
      }

      return isOk
    }

    return false
  }

  getCurrentQuality(): string {
    return this.quality
  }

  setCurrentQuality(quality: string): void {
    this.quality = quality
  }

  subtitleFontScalePlus(): void {
    this.subtitlesFontScale =
      (+this.subtitlesFontScale.toFixed(2) * 100 + +(0.1).toFixed(2) * 100) / 100
  }

  subtitleFontScaleMinus(): void {
    this.subtitlesFontScale =
      (+this.subtitlesFontScale.toFixed(2) * 100 - +(0.1).toFixed(2) * 100) / 100
  }

  subtitleFontScaleDefault(): void {
    this.subtitlesFontScale = this.SUBTITLES_FONT_SCALE_DEFAULT
  }

  async subtitleOff(): Promise<boolean> {
    return await this.caster.removeSubtitles()
  }

  async subtitleOn(activeTrackIndex = 0): Promise<boolean> {
    return await this.caster.showSubtitle(activeTrackIndex)
  }

  async subtitlePlus(): Promise<boolean> {
    this.subtitleFontScalePlus()
    return await this.caster.subtitleChangeFontScale(this.getSubtitleFontScale())
  }

  async subtitleMinus(): Promise<boolean> {
    this.subtitleFontScaleMinus()
    return await this.caster.subtitleChangeFontScale(this.getSubtitleFontScale())
  }

  async resetFontSize(): Promise<boolean> {
    this.subtitleFontScaleDefault()
    return await this.caster.subtitleChangeFontScale(this.getSubtitleFontScale())
  }

  getSubtitleFontScale(): number {
    return this.subtitlesFontScale
  }
}
