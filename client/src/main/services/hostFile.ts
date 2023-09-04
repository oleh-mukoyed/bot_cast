import { prepareHostFileName } from '@bot_cast/shared'
import address from 'address'
import express from 'express'
import fs from 'fs'
import { Server } from 'http'
import mime from 'mime'
import path from 'path'

export class HostFile {
  private fileServer: Server | false = false
  private static instance: HostFile

  private constructor() {}

  static getInstance(): HostFile {
    if (!this.instance) {
      this.instance = new HostFile()
    }

    return this.instance
  }

  async hostFile(filePath: string, allowedTypes: string[] = []): Promise<string | boolean> {
    return new Promise(async (resolve, _) => {
      try {
        if (this.fileServer) this.fileServer.close()

        console.log('filePath :', filePath)
        const mimeType = this.getMimeIfAllowed(filePath, allowedTypes)
        console.log('mimeType :', mimeType)
        if (!mimeType) resolve(false)

        const app = express()
        const port = import.meta.env.MAIN_VITE_FILE_HOST_PORT
        const ip = address.ip('Ethernet')

        const fileName = prepareHostFileName(path.basename(filePath))
        const url = `/file/${fileName}`

        app.get(url, (_, res) => {
          const mediaPath = path.join(filePath)

          const stat = fs.statSync(mediaPath)
          const fileSize = stat.size
          const head = {
            'Content-Length': fileSize,
            'Content-Type': mimeType as string
          }
          res.writeHead(200, head)
          fs.createReadStream(mediaPath).pipe(res)
        })

        const server = app.listen(port, () => {
          this.fileServer = server
          resolve(`http://${ip}:${port}${url}`)
        })
      } catch (error) {
        resolve(false)
      }
    })
  }

  //todo https://developers.google.com/cast/docs/reference/web_receiver/cast.framework.CastReceiverContext#canDisplayType
  getMimeIfAllowed(filePath: string, allowedTypes: string[] = []): string | false {
    const mimeType = mime.getType(filePath)

    if (!mimeType) return false

    if (allowedTypes.length && allowedTypes.indexOf(mimeType) === -1) return false

    return mimeType
  }
}
