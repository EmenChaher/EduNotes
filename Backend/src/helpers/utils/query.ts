export const handleQueryParams = (param: string | string[] | undefined): string[] | string | undefined => {
  if (!param) return undefined;
  if (Array.isArray(param)) return param;
  const values = param.split(',').map((value) => value.trim());
  return values.length === 1 ? values[0] : values;
};
