export class Url {
  static isValid(string: string): boolean {
    try {
      const url = new URL(string)
      return url.protocol === 'https:'
    } catch (e) {
      return false
    }
  }

  static getResourceType(string: string): string {
    const videoResources = {
      REZKA_SERIES: /\/(\d+).*t:(\d+)-s:(\d+)-e:(\d+)/g,
      REZKA_FILMS: /\/(\d+).*\.html$/g
    }

    for (const type in videoResources) {
      const regExp = videoResources[type as keyof object] as RegExp

      if (regExp.test(string)) return type
    }

    return ''
  }
}
