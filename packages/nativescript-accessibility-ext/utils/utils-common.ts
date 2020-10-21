import { Observable } from '@nativescript/core';

export interface SharedA11YObservable extends Observable {
  readonly accessibilityServiceEnabled?: boolean;
}
export class CommonA11YServiceEnabledObservable extends Observable {
  readonly accessibilityServiceEnabled: boolean;
  constructor(sharedA11YObservable: SharedA11YObservable) {
    super();

    const ref = new WeakRef(this);
    let lastValue: boolean;
    function callback() {
      const self = ref && ref.get();
      if (!self) {
        sharedA11YObservable.off(Observable.propertyChangeEvent, callback);

        return;
      }

      const newValue = sharedA11YObservable.accessibilityServiceEnabled;
      if (newValue !== lastValue) {
        self.set(AccessibilityServiceEnabledPropName, newValue);
        lastValue = newValue;
      }
    }

    sharedA11YObservable.on(Observable.propertyChangeEvent, callback);

    this.set(AccessibilityServiceEnabledPropName, sharedA11YObservable.accessibilityServiceEnabled);
  }
}

export const AccessibilityServiceEnabledPropName = 'accessibilityServiceEnabled';
