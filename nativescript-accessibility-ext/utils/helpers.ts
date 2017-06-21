import * as trace from 'tns-core-modules/trace';
import { View } from 'tns-core-modules/ui/core/view'
export { View } from 'tns-core-modules/ui/core/view'
export { ViewCommon } from 'tns-core-modules/ui/core/view/view-common'
import { Property } from 'tns-core-modules/ui/core/properties';
export { Property } from 'tns-core-modules/ui/core/properties';

export function noop() {
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

export interface TypeClass<T extends View> {
  new (): T;
};

export function addPropertyToView<ViewType extends View, T>(viewClass: TypeClass<ViewType>, name: string, defaultValue?: T): Property<ViewType, T> {
  const property = new Property<ViewType, T>({
    name,
    defaultValue,
  });
  property.register(viewClass);

  return property;
}

export function writeTrace(message: string) {
  if (trace.isEnabled()) {
    trace.write(message, 'A11Y');
  }
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
      object: this.owner,
      value: receivedFocus,
    });

    if (receivedFocus) {
      view.notify({
        eventName: 'accessibilityFocus',
        object: this.owner,
      });
    } else if (lostFocus) {
      view.notify({
        eventName: 'accessibilityBlur',
        object: this.owner,
      });
    }
  }
}
