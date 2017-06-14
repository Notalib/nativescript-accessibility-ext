import { PropertyChangeData } from 'ui/core/dependency-observable';
export declare function setNativeValueFn(viewClass: any, propertyName: string, fn?: (data: PropertyChangeData) => void): void;
export declare function setViewFunction(viewClass: any, fnName: any, fn?: Function): void;
export declare function enforceArray(val: string | string[]): string[];
export declare function inputArrayToBitMask(val: string | string[], map: Map<string, number>): number;
