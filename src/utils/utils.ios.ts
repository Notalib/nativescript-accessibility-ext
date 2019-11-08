import * as nsApp from '@nativescript/core/application';
import { Observable } from '@nativescript/core/data/observable';
import { isTraceEnabled, writeErrorTrace, writeTrace } from '../trace';
import { AccessibilityServiceEnabledPropName, CommonA11YServiceEnabledObservable, SharedA11YObservable } from './utils-common';

export function isAccessibilityServiceEnabled() {
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

let sharedA11YObservable: SharedA11YObservable;
let nativeObserver: any;

function ensureStateListener() {
  if (sharedA11YObservable) {
    return sharedA11YObservable;
  }

  sharedA11YObservable = new Observable() as SharedA11YObservable;

  sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isAccessibilityServiceEnabled());

  if (typeof UIAccessibilityVoiceOverStatusDidChangeNotification !== 'undefined') {
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
  } else if (typeof UIAccessibilityVoiceOverStatusChanged !== 'undefined') {
    nativeObserver = nsApp.ios.addNotificationObserver(UIAccessibilityVoiceOverStatusChanged, () =>
      sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isAccessibilityServiceEnabled()),
    );

    nsApp.on(nsApp.exitEvent, () => {
      if (nativeObserver) {
        nsApp.ios.removeNotificationObserver(nativeObserver, UIAccessibilityVoiceOverStatusChanged);
      }

      nativeObserver = null;
      if (sharedA11YObservable) {
        sharedA11YObservable.removeEventListener(Observable.propertyChangeEvent);
        sharedA11YObservable = null;
      }
    });
  }

  nsApp.on(nsApp.resumeEvent, () => sharedA11YObservable.set('isAccessibilityServiceEnabled', isAccessibilityServiceEnabled()));

  return sharedA11YObservable;
}

export class AccessibilityServiceEnabledObservable extends CommonA11YServiceEnabledObservable {
  constructor() {
    super(ensureStateListener());
  }
}

export * from '@nativescript/core/utils/utils';
