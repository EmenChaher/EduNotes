export function isValidMongoId(id: string): boolean {
  const validObjectIdRegex: RegExp = /^[0-9a-fA-F]{24}$/
  return validObjectIdRegex.test(id)
}
