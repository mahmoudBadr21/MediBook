const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

const timeToMinutes = (timeStr) => {
  const [ hour, minutes ] = timeStr.split(':').map(Number)
  return hour * 60 + minutes
}

export {timeFormatRegex, timeToMinutes}