/// <reference path="../ui/core/view.d.ts" />

import { booleanConverter, CssProperty, InheritedCssProperty, Page, Property, Style, View } from '@nativescript/core';
import { AccessibilityBlurEventData, AccessibilityFocusChangedEventData, AccessibilityFocusEventData } from '@nativescript/core/ui/core/view';
import { isTraceEnabled, writeErrorTrace, writeTrace } from '../trace';

const lastFocusedViewOnPageKeyName = '__lastFocusedViewOnPage';

export function getLastFocusedViewOnPage(page: Page): View | null {
  try {
    const lastFocusedViewRef = page[lastFocusedViewOnPageKeyName] as WeakRef<View>;
    if (!lastFocusedViewRef) {
      return null;
    }

    const lastFocusedView = lastFocusedViewRef.get();
    if (!lastFocusedView) {
      return null;
    }

    if (!lastFocusedView.parent || lastFocusedView.page !== page) {
      return null;
    }

    return lastFocusedView;
  } catch {
    // ignore
  } finally {
    delete page[lastFocusedViewOnPageKeyName];
  }

  return null;
}

/**
 * Dummy function that does nothing.
 */
export function noop() {
  // ignore
}

export function makePropertyEnumConverter<T>(enumValues: any) {
  return (value: string): T | null => {
    if (!value) {
      return null;
    }

    for (const [key, v] of Object.entries<T>(enumValues)) {
      if (key === value || `${v}` === `${value}`.toLowerCase()) {
        return v;
      }
    }

    return null;
  };
}

/**
 * Add a new function to a View-class
 */
export function setViewFunction(viewClass: any, fnName: string, fn?: Function) {
  viewClass.prototype[fnName] = fn || noop;
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

export function enforceArray(val: string | string[]): string[] {
  if (Array.isArray(val)) {
    return val;
  }

  if (typeof val === 'string') {
    return val.split(/[, ]/g).filter((v: string) => !!v);
  }

  if (isTraceEnabled()) {
    writeTrace(`enforceArray: val is of unsupported type: ${val} -> ${typeof val}`);
  }

  return [];
}

/**
 * Convert array of values into a bitmask.
 *
 * @param values string values
 * @param map    map lower-case name to integer value.
 */
export function inputArrayToBitMask(values: string | string[], map: Map<string, number>): number {
  return (
    enforceArray(values)
      .filter((value) => !!value)
      .map((value) => `${value}`.toLocaleLowerCase())
      .filter((value) => map.has(value))
      .reduce((res, value) => res | map.get(value), 0) || 0
  );
}

/**
 * Extend NativeScript View with a new property.
 */
export function addPropertyToView<T>(viewClass: typeof View, name: string, defaultValue?: T, valueConverter?: (value: string) => T): Property<View, T> {
  const property = new Property<View, T>({
    name,
    defaultValue,
    valueConverter,
  });
  property.register(viewClass);

  return property;
}

export function addBooleanPropertyToView(viewClass: typeof View, name: string, defaultValue?: boolean): Property<View, boolean> {
  return addPropertyToView(viewClass, name, defaultValue, booleanConverter);
}

export function addCssPropertyToView<T>(
  viewClass: typeof View,
  name: string,
  cssName: string,
  inherited = false,
  defaultValue?: T,
  valueConverter?: (value: string) => T,
): CssProperty<Style, T> {
  let property: CssProperty<Style, T> | InheritedCssProperty<Style, T>;

  if (inherited) {
    property = new InheritedCssProperty({
      name,
      cssName,
      defaultValue,
      valueConverter,
    });
  } else {
    property = new CssProperty({
      name,
      cssName,
      defaultValue,
      valueConverter,
    });
  }

  Object.defineProperty(viewClass.prototype, name, {
    set(this: View, value: T) {
      this.style[name] = value;
    },
    get(this: View) {
      return this.style[name];
    },
  });

  property.register(Style);

  return property;
}

export function addBooleanCssPropertyToView(viewClass: typeof View, name: string, cssName: string, inherited = false, defaultValue?: boolean) {
  return addCssPropertyToView(viewClass, name, cssName, inherited, defaultValue, booleanConverter);
}

/**
 * Send notification when accessibility focus state changes.
 * If either receivedFocus or lostFocus is true, 'accessibilityFocusChanged' is send with value true if element received focus
 * If receivedFocus, 'accessibilityFocus' is send
 * if lostFocus, 'accessibilityBlur' is send
 *
 * @param {View} view
 * @param {boolean} receivedFocus
 * @param {boolean} lostFocus
 */
export function notifyAccessibilityFocusState(view: View, receivedFocus: boolean, lostFocus: boolean): void {
  if (!receivedFocus && !lostFocus) {
    return;
  }

  if (isTraceEnabled()) {
    writeTrace(
      `notifyAccessibilityFocusState: ${JSON.stringify({
        name: 'notifyAccessibilityFocusState',
        receivedFocus,
        lostFocus,
        view: `${view}`,
      })}`,
    );
  }

  view.notify({
    eventName: View.accessibilityFocusChangedEvent,
    object: view,
    value: !!receivedFocus,
  } as AccessibilityFocusChangedEventData);

  if (receivedFocus) {
    if (view.page) {
      view.page[lastFocusedViewOnPageKeyName] = new WeakRef(view);
    }

    view.notify({
      eventName: View.accessibilityFocusEvent,
      object: view,
    } as AccessibilityFocusEventData);
  } else if (lostFocus) {
    view.notify({
      eventName: View.accessibilityBlurEvent,
      object: view,
    } as AccessibilityBlurEventData);
  }
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
