export function minutesToTimeString(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  const period = hours24 >= 12 ? "PM" : "AM"
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  const minStr = String(mins).padStart(2, "0")
  return `${hours12}:${minStr} ${period}`
}
