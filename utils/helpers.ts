function noop() {
}

export function setViewFunction(viewClass: any, fnName, fn?: Function) {
  viewClass.prototype[fnName] = fn || noop;
}

export function enforceArray(val: string | string[]): string[] {
  if (Array.isArray(val)) {
    return val;
  }

  if (typeof val === 'string') {
    return val.split(/[, ]/g).filter((v: string) => !!v);
  }

  console.error(`val is of unsupported type: ${val} -> ${typeof val}`);
  return [];
}

export function inputArrayToBitMask(val: string | string[], map: Map<string, number>): number {
  return enforceArray(val)
    .filter((val) => !!val)
    .map((val) => val.toLocaleLowerCase())
    .filter((val) => map.has(val))
    .reduce((c, val) => c | map.get(val), 0) || 0;
}
