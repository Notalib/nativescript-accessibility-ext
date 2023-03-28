import { View } from '@nativescript/core';
import { writeErrorTrace } from '../trace';

/**
 * Dummy function that does nothing.
 */
export function noop() {
  // ignore
}

function getOriginalWrappedFnName(viewName: string, fnName: string) {
  return `___a11y_${viewName}_${fnName}`;
}

/**
 * Wrap a function on an object.
 * The original function will be called before the func.
 */
export function wrapFunction(obj: any, fnName: string, func: Function, objName: string) {
  const origFNName = getOriginalWrappedFnName(objName, fnName);

  obj[origFNName] = (obj[origFNName] || obj[fnName]) as Function;

  obj[fnName] = function (...args: any[]) {
    let origFN = obj[origFNName];
    if (!origFN) {
      writeErrorTrace(`wrapFunction(${obj}) don't have an original function for ${fnName}`);

      origFN = noop;
    }

    const res = origFN.call(this, ...args);

    func.call(this, ...args);

    return res;
  };
}

/**
 * Unwrap a function on a class wrapped by wrapFunction.
 */
export function unwrapFunction(obj: any, fnName: string, viewName: string) {
  const origFNName = getOriginalWrappedFnName(viewName, fnName);
  if (!obj[origFNName]) {
    return;
  }

  obj[fnName] = obj[origFNName];
  delete obj[origFNName];
}

/**
 * Get the view's ngCssClasses-Map for nativescript-angular.
 * This needs to be updated if the css-class is to remain enabled
 * on updates.
 */
export function getViewNgCssClassesMap(view: any): Map<string, boolean> {
  // Zone is globally available on nativescript-angular. If defined assume angular environment.
  if (typeof Zone === 'undefined') {
    return new Map<string, boolean>();
  }

  if (!view.ngCssClasses) {
    view.ngCssClasses = new Map<string, boolean>();
  }

  return view.ngCssClasses;
}

export interface A11YCssClasses {
  [className: string]: boolean;
}

export interface HmrSafeEventsCallback {
  (...args: any[]): any;
}

/**
 * Adding global events during development is problematic, when HMR is enabled.
 * This helper solved the problem, by removing the old event before adding the new event
 */
export function hmrSafeEvents(
  fnName: string,
  events: string[],
  obj: {
    on(eventName: string, cb: HmrSafeEventsCallback): void;
    off(eventName: string, cb: HmrSafeEventsCallback): void;
  },
  callback: HmrSafeEventsCallback,
  thisArg?: any,
) {
  if (fnName in obj) {
    for (const eventName of events) {
      obj.off(eventName, obj[fnName]);
    }
  }

  obj[fnName] = thisArg ? callback.bind(thisArg) : callback;
  for (const eventName of events) {
    obj.on(eventName, obj[fnName]);
  }
}

declare const Zone: any;
export function viewSetCssClasses(view: View, a11yCssClasses: A11YCssClasses): boolean {
  // Zone is globally available on nativescript-angular. If defined assume angular environment.
  if (typeof Zone !== 'undefined') {
    const ngCssClasses = getViewNgCssClassesMap(view);

    for (const [className, enabled] of Object.entries(a11yCssClasses)) {
      if (enabled) {
        ngCssClasses.set(className, true);
      } else {
        ngCssClasses.delete(className);
      }
    }
  }

  let changed = false;
  for (const [className, enabled] of Object.entries(a11yCssClasses)) {
    if (view.cssClasses.has(className)) {
      if (enabled) {
        continue;
      }

      view.cssClasses.delete(className);

      changed = true;

      continue;
    }

    if (enabled) {
      view.cssClasses.add(className);

      changed = true;
      continue;
    }
  }

  if (changed) {
    view._onCssStateChange();
  }

  return changed;
}
