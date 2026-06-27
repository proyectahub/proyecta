function isValidMoneroAddress(address) {
  if (!address || typeof address !== "string") return false
  if (address.length !== 95) return false
  const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/
  return base58Regex.test(address)
}

function isValidProjectId(projectId) {
  if (!projectId || typeof projectId !== "string") return false
  const alphanumericHyphensUnderscore = /^[a-zA-Z0-9_-]+$/
  return alphanumericHyphensUnderscore.test(projectId) && projectId.length <= 255
}

function sanitizeAddress(address) {
  if (!address) return ""
  return String(address).trim()
}

function sanitizeProjectId(projectId) {
  if (!projectId) return ""
  return String(projectId).trim().replace(/[^a-zA-Z0-9_-]/g, "")
}

export { isValidMoneroAddress, isValidProjectId, sanitizeAddress, sanitizeProjectId }
