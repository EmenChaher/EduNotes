export const formatElementCount = (count: number, singularName: string, pluralName?: string): string => {
  const name = count === 1 ? singularName : pluralName || `${singularName}s`
  return `${count} ${name}`
}
