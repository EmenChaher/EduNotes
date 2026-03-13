export function flattenPaginatedData<T>(paginatedData: { [page: number]: T[] }): T[] {
  const flattenedData: T[] = []
  Object.values(paginatedData).forEach((pageData) => {
    flattenedData.push(...pageData)
  })
  return flattenedData
}

export function paginateData<T>(dataArray: T[], pageSize: number): { [page: number]: T[] } {
  const paginatedData: { [page: number]: T[] } = {}
  dataArray.forEach((item, index) => {
    const pageIndex = Math.floor(index / pageSize) + 1
    if (!paginatedData[pageIndex]) {
      paginatedData[pageIndex] = []
    }
    paginatedData[pageIndex].push(item)
  })
  return paginatedData
}
