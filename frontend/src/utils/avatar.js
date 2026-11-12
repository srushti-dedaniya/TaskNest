/**
 * Generates user avatar initials from their full name.
 * Extracts the first letter of their first name and the first letter of their surname.
 *
 * Examples:
 * - "Srushti Dedaniya" => "SD"
 * - "Elena Rostova" => "ER"
 * - "Julian Vance" => "JV"
 * - "Srushti" => "S"
 *
 * @param {string} name - Full user name
 * @param {string} [fallback='TN'] - Fallback initials if name is missing
 * @returns {string} Initials in uppercase
 */
export function getInitials(name, fallback = 'TN') {
  if (!name || typeof name !== 'string') return fallback
  const clean = name.trim()
  if (!clean) return fallback

  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return fallback

  if (parts.length === 1) {
    return parts[0][0].toUpperCase()
  }

  const firstLetter = parts[0][0].toUpperCase()
  const surnameLetter = parts[parts.length - 1][0].toUpperCase()

  return `${firstLetter}${surnameLetter}`
}

export default getInitials

