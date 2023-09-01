import { ALLOWED_FILE_TYPES_MIME } from '@bot_cast/shared'

export function checkFiles(files: File[]): File[] {
  const checkedFiles: File[] = []
  for (const file of files) {
    if (ALLOWED_FILE_TYPES_MIME.indexOf(file.type) === -1) continue
    checkedFiles.push(file)
  }

  return checkedFiles
}

export function getFileNameByUrl(url: string): string {
  const fileUrl = new URL(url)
  const fileName = fileUrl.pathname.split('/').pop()

  return fileName as string
}
