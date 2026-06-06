export function cleanQueryParam(value: any): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const strValue = String(value);
  if (strValue === 'undefined' || strValue === 'null') {
    return undefined;
  }
  return strValue;
}

export function cleanQueryParams<T extends Record<string, any>>(params: T): {
  [K in keyof T]: T[K] extends string ? string | undefined : T[K] extends number ? number : any;
} {
  const result: any = {};
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (typeof value === 'string') {
      result[key] = cleanQueryParam(value);
    } else if (typeof value === 'number') {
      result[key] = value;
    } else {
      result[key] = value;
    }
  }
  return result;
}
