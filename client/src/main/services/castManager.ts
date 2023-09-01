import { StageController } from '../interfaces/stageController.interface'
import { FilmCastController as RezkaFilmCastController } from '../video_resources/hdrezka/filmCastController'
import { SeriesCastController as RezkaSeriesCastController } from '../video_resources/hdrezka/seriesCastController'
import { Url } from './url'

export class CastManager {
  static getCastController(url: string): StageController | undefined {
    if (!Url.isValid(url)) return

    const type = Url.getResourceType(url)

    switch (type) {
      case 'REZKA_SERIES':
        return new RezkaSeriesCastController(url)
      case 'REZKA_FILMS':
        return new RezkaFilmCastController(url)
    }

    return
  }
}
