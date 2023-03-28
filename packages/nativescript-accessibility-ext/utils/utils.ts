import { Observable, Application } from '@nativescript/core';
import { isAccessibilityServiceEnabled } from '@nativescript/core/accessibility';

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

let sharedA11YObservable: SharedA11YObservable;

function getSharedA11YObservable(): SharedA11YObservable {
  if (sharedA11YObservable) {
    return sharedA11YObservable;
  }

  sharedA11YObservable = new Observable() as SharedA11YObservable;

  sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isAccessibilityServiceEnabled());

  if (sharedA11YObservable) {
    sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isAccessibilityServiceEnabled());
  }

  Application.on(Application.exitEvent, () => {
    sharedA11YObservable?.removeEventListener(Observable.propertyChangeEvent);
  });

  Application.on(Application.resumeEvent, () => sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isAccessibilityServiceEnabled()));

  return sharedA11YObservable;
}

export class AccessibilityServiceEnabledObservable extends CommonA11YServiceEnabledObservable {
  constructor() {
    super(getSharedA11YObservable());
  }
}

export * from '@nativescript/core/utils';
