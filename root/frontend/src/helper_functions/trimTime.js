export default function trimTime (str /* 2023-08-17T15:41:10.645+00:00 */) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const year = str.slice(0, 4)
  let month = str.slice(5, 7)
  month = month[0] === '0' ? +month[1] - 1 : +month - 1
  const day = str.slice(8, 10)
  const time = str.slice(11, 16)
  return `${months[month]} ${day} ${year} at ${time}`
}
