import * as trace from 'tns-core-modules/trace';
import { Property } from 'tns-core-modules/ui/core/properties';
import {
  AccessibilityBlurEventData,
  AccessibilityFocusChangedEventData,
  AccessibilityFocusEventData,
  booleanConverter,
  View,
} from 'tns-core-modules/ui/core/view';

export function noop() {
  // ignore
}

export interface ViewType<T extends View> {
  new (): T;
}

export function setViewFunction(viewClass: any, fnName: string, fn?: Function) {
  viewClass.prototype[fnName] = fn || noop;
}

export function enforceArray(val: string | string[]): string[] {
  if (Array.isArray(val)) {
    return val;
  }

  if (typeof val === 'string') {
    return val.split(/[, ]/g).filter((v: string) => !!v);
  }

  writeTrace(`enforceArray: val is of unsupported type: ${val} -> ${typeof val}`);

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
export function addPropertyToView<ViewClass extends View, T>(
  viewClass: ViewType<ViewClass>,
  name: string,
  defaultValue?: T,
  valueConverter?: (value: string) => T,
): Property<ViewClass, T> {
  const property = new Property<ViewClass, T>({
    name,
    defaultValue,
    valueConverter,
  });
  property.register(viewClass);

  return property;
}

export function addBooleanPropertyToView<ViewClass extends View>(
  viewClass: ViewType<ViewClass>,
  name: string,
  defaultValue?: boolean,
): Property<ViewClass, boolean> {
  return addPropertyToView(viewClass, name, defaultValue, booleanConverter);
}

/**
 * Write to NativeScript's trace.
 */
export function writeTrace(message: string, type = trace.messageType.info) {
  if (trace.isEnabled()) {
    trace.write(message, 'A11Y', type);
  }
}

export function writeErrorTrace(message) {
  writeTrace(message, trace.messageType.error);
}

export function writeWarnTrace(message) {
  writeTrace(message, trace.messageType.warn);
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

  writeTrace(
    `notifyAccessibilityFocusState: ${JSON.stringify({
      name: 'notifyAccessibilityFocusState',
      receivedFocus,
      lostFocus,
      view: String(view),
    })}`,
  );

  view.notify({
    eventName: View.accessibilityFocusChangedEvent,
    object: view,
    value: !!receivedFocus,
  } as AccessibilityFocusChangedEventData);

  if (receivedFocus) {
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
