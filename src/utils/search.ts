import { Variable } from '../types'

/**
 * Simple fuzzy search implementation
 * Filters variables based on query matching name or value
 */
export function fuzzySearch(variables: Variable[], query: string): Variable[] {
  const lowerQuery = query.toLowerCase()

  return variables.filter((variable) => {
    const nameLower = variable.name.toLowerCase()
    const valueLower = variable.value.toLowerCase()

    // Check if query characters appear in order in name or value
    let nameIdx = 0
    let valueIdx = 0

    for (const char of lowerQuery) {
      const namePos = nameLower.indexOf(char, nameIdx)
      const valuePos = valueLower.indexOf(char, valueIdx)

      if (namePos !== -1) {
        nameIdx = namePos + 1
      } else if (valuePos !== -1) {
        valueIdx = valuePos + 1
      } else {
        return false
      }
    }

    return true
  })
}

/**
 * Calculate match score for sorting results
 * Higher score = better match
 */
export function calculateMatchScore(variable: Variable, query: string): number {
  const lowerQuery = query.toLowerCase()
  const nameLower = variable.name.toLowerCase()

  // Exact match gets highest score
  if (nameLower === lowerQuery) {
    return 1000
  }

  // Start of name match gets high score
  if (nameLower.startsWith(lowerQuery)) {
    return 500 + lowerQuery.length
  }

  // Contains match gets medium score
  if (nameLower.includes(lowerQuery)) {
    return 100 + lowerQuery.length
  }

  return 0
}
