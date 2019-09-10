import * as nsApp from 'tns-core-modules/application';
import { Observable } from 'tns-core-modules/data/observable';
import { isTraceEnabled, writeErrorTrace, writeTrace } from '../trace';
import { AccessibilityServiceEnabledPropName, CommonA11YServiceEnabledObservable } from './utils-common';

export * from 'tns-core-modules/utils/utils';

export function isAccessibilityServiceEnabled(): boolean {
  const cls = `isAccessibilityServiceEnabled<ios>()`;
  if (typeof UIAccessibilityIsVoiceOverRunning !== 'function') {
    writeErrorTrace(`${cls} - UIAccessibilityIsVoiceOverRunning() - is not a function`);
    return false;
  }

  const isEnabled = !!UIAccessibilityIsVoiceOverRunning();
  if (isTraceEnabled()) {
    writeTrace(`${cls}: isEnabled:${isEnabled}`);
  }

  return isEnabled;
}
interface SharedA11YObservable extends Observable {
  readonly accessibilityServiceEnabled?: boolean;
}
let sharedA11YObservable: SharedA11YObservable;
let nativeObserver: any;

function ensureStateListener() {
  if (sharedA11YObservable) {
    return;
  }

  sharedA11YObservable = new Observable() as SharedA11YObservable;

  sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isAccessibilityServiceEnabled());

  if (typeof UIAccessibilityVoiceOverStatusDidChangeNotification === 'undefined') {
    return;
  }

  nativeObserver = nsApp.ios.addNotificationObserver(UIAccessibilityVoiceOverStatusDidChangeNotification, () =>
    sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isAccessibilityServiceEnabled()),
  );

  nsApp.on(nsApp.exitEvent, () => {
    if (nativeObserver) {
      nsApp.ios.removeNotificationObserver(nativeObserver, UIAccessibilityVoiceOverStatusDidChangeNotification);
    }

    nativeObserver = null;
    sharedA11YObservable = null;
  });

  nsApp.on(nsApp.resumeEvent, () => sharedA11YObservable.set('isAccessibilityServiceEnabled', isAccessibilityServiceEnabled()));
}

export class AccessibilityServiceEnabledObservable extends CommonA11YServiceEnabledObservable {
  constructor() {
    super();

    ensureStateListener();

    const ref = new WeakRef(this);
    let lastValue: boolean;
    sharedA11YObservable.on(Observable.propertyChangeEvent, function callback() {
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
    });

    this.set(AccessibilityServiceEnabledPropName, sharedA11YObservable.accessibilityServiceEnabled);
  }
}
