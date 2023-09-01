export function getTimeStr(): string {
  const date = new Date()
  let hours: number | string = date.getHours()
  let minutes: number | string = date.getMinutes()
  let seconds: number | string = date.getSeconds()

  // Check whether AM or PM
  const newformat = hours >= 12 ? 'pm' : 'am'

  // Find current hour in AM-PM Format
  hours = hours % 12

  // To display "0" as "12"
  hours = hours ? hours : 12
  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  return hours + ':' + minutes + ':' + seconds + newformat
}
