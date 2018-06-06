import * as trace from 'tns-core-modules/trace';
import { Property } from 'tns-core-modules/ui/core/properties';
import { traceMessageType, View } from 'tns-core-modules/ui/core/view';
import { ViewCommon } from 'tns-core-modules/ui/core/view/view-common';

export {
  View,
  ViewCommon,
  Property,
};

export function noop() {
}

export interface ViewType<T extends ViewCommon> {
  new (): T;
}

export function setViewFunction(viewClass: any, fnName: string, fn?: Function) {
  viewClass.prototype[fnName] = fn || noop;
}

export function enforceArray(val: string | string[]): string[] {
  if (Array.isArray(val)) {
    return val;
  }

  if (typeof val === 'string') {
    return val.split(/[, ]/g).filter((v: string) => !!v);
  }

  writeTrace(`enforceArray: val is of unsupported type: ${val} -> ${typeof val}`);

  return [];
}

export function inputArrayToBitMask(val: string | string[], map: Map<string, number>): number {
  return enforceArray(val)
    .filter((val) => !!val)
    .map((val) => val.toLocaleLowerCase())
    .filter((val) => map.has(val))
    .reduce((c, val) => c | map.get(val), 0) || 0;
}

export function addPropertyToView<ViewClass extends View, T>(viewClass: ViewType<ViewClass>, name: string, defaultValue?: T): Property<ViewClass, T> {
  const property = new Property<ViewClass, T>({
    name,
    defaultValue,
  });
  property.register(viewClass);

  return property;
}

/**
 * Write to NativeScript's trace.
 */
export function writeTrace(message: string, type: number = traceMessageType.info) {
  if (trace.isEnabled()) {
    trace.write(message, 'A11Y', type);
  }
}

export function writeErrorTrace(message) {
  writeTrace(message, traceMessageType.error);
}

export function writeWarnTrace(message) {
  writeTrace(message, traceMessageType.warn);
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
export function notityAccessibilityFocusState(view: View, receivedFocus: boolean, lostFocus: boolean): void {
  if (receivedFocus || lostFocus) {
    writeTrace(`notityAccessibilityFocusState: ${JSON.stringify({
      name: 'notityAccessibilityFocusState',
      receivedFocus,
      lostFocus,
      view: String(view),
    })}`);

    view.notify({
      eventName: 'accessibilityFocusChanged',
      object: view,
      value: receivedFocus,
    });

    if (receivedFocus) {
      view.notify({
        eventName: 'accessibilityFocus',
        object: view,
      });
    } else if (lostFocus) {
      view.notify({
        eventName: 'accessibilityBlur',
        object: view,
      });
    }
  }
}
