import { PropertyChangeData, Property } from 'ui/core/dependency-observable';
import { PropertyMetadata } from 'ui/core/proxy';
import * as proxy from 'ui/core/proxy';
import * as trace from 'trace';
import { View } from 'ui/core/view';

function noop() {
}

export function setNativeValueFn(viewClass: any, propertyName: string, fn?: (data: PropertyChangeData) => void) {
  (<proxy.PropertyMetadata>(<any>viewClass)[`${propertyName}Property`].metadata).onSetNativeValue = fn || noop;
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

export function addPropertyToView(viewClass: any, viewName: string, name: string, defaultValue?: any) {
  const property = new Property(name, viewName, new PropertyMetadata(defaultValue));
  viewClass[`${name}Property`] = property;

  Object.defineProperty(viewClass.prototype, name, {
    get() {
      this._getValue(property);
    },
    set(value: any) {
      this._setValue(property, value);
    },
    enumerable: true,
    configurable: true
  });
}

export function writeTrace(message: string) {
  if (trace.enabled) {
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
    this.owner.notify({
      eventName: 'accessibilityFocusChanged',
      object: this.owner,
      value: receivedFocus,
    });

    if (receivedFocus) {
      this.owner.notify({
        eventName: 'accessibilityFocus',
        object: this.owner,
      });
    } else if (lostFocus) {
      this.owner.notify({
        eventName: 'accessibilityBlur',
        object: this.owner,
      });
    }
  }
}
