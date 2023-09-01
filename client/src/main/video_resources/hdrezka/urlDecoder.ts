import { AssociativeArray } from '../../types/index'

export class UrlDecoder {
  constructor(private readonly url: string) {
    if (!url) throw new Error('Nothing to decode!')

    this.url = url
  }

  getUrls(): AssociativeArray<string[]> {
    const decodedStr: string = this.decodeResponse()

    if (!decodedStr) throw new Error('Decoded string empty')

    const urls: string[] = decodedStr.split(',')
    const urlsWithQuality: AssociativeArray<string[]> = {}
    for (let i = 0; i < urls.length; i++) {
      const tmp: string = urls[i]
      const fq: RegExpMatchArray | null = tmp.match(/\[(.+)\]/)

      if (fq === null) continue

      urlsWithQuality[fq[1]] = tmp.replace(fq[0], '').split(' or ')
    }

    return urlsWithQuality
  }

  private decodeResponse(): string {
    let r = this.url

    r = r.replace('#h', '')

    // Generate trash codes
    const trashCodesSet: Set<string> = new Set()
    const trashList: string[] = ['@', '#', '!', '^', '$']
    for (let i = 2; i <= 3; i++) {
      for (const chars of this.generateCombinations(trashList, i)) {
        const trashCombo: string = Buffer.from(chars.join('')).toString('base64')
        trashCodesSet.add(trashCombo)
      }
    }

    // Clean 1st step
    const tempList: string[] = this.decodeCleanList(
      r.replace(/(\/|\\)/g, '').split('_'),
      trashCodesSet
    )

    // Result preparing
    let startFromPosition: number = tempList.length
    while (startFromPosition !== 1) {
      const itemString: string = tempList[startFromPosition - 2] + tempList[startFromPosition - 1]
      const output: string = this.decodeTrash(itemString, trashCodesSet)
      tempList.pop()
      tempList.pop()
      tempList.push(output)
      startFromPosition = tempList.length
    }

    const rDecoded: string = Buffer.from(tempList.join(''), 'base64').toString()

    return rDecoded
  }

  decodeTrash(str: string, removeList: Set<string>): string {
    const n = 4
    let cleanedSubstring: string = str
    let y = 0
    while (y < str.length) {
      const chunk: string = str.slice(y, y + n)
      if (removeList.has(chunk)) {
        cleanedSubstring = cleanedSubstring.replace(chunk, '')
      } else {
        break
      }
      y += n
    }

    return cleanedSubstring
  }

  decodeCleanList(decList: string[], removeList: Set<string>): string[] {
    const listCleaned: string[] = []
    for (let i = decList.length - 1; i >= 0; i--) {
      const currentSubstring = decList[i]
      listCleaned.unshift(this.decodeTrash(currentSubstring, removeList))
    }

    return listCleaned
  }

  generateCombinations(arr: string[], length: number): string[][] {
    if (length === 1) return arr.map((el) => [el])

    const combinations: string[][] = []
    const smallerCombinations: string[] | string[][] = this.generateCombinations(arr, length - 1)
    for (const el of arr) {
      for (const combination of smallerCombinations) {
        combinations.push([el, ...combination])
      }
    }

    return combinations
  }
}
