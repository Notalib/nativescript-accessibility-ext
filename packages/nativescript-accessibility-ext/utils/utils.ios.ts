import * as nsApp from '@nativescript/core/application';
import { Observable } from '@nativescript/core/data/observable';
import { writeErrorTrace } from '../trace';
import { AccessibilityServiceEnabledPropName, CommonA11YServiceEnabledObservable, SharedA11YObservable } from './utils-common';

export function isAccessibilityServiceEnabled() {
  return getSharedA11YObservable().accessibilityServiceEnabled;
}

let sharedA11YObservable: SharedA11YObservable;
let nativeObserver: any;

function getSharedA11YObservable(): SharedA11YObservable {
  if (sharedA11YObservable) {
    return sharedA11YObservable;
  }

  sharedA11YObservable = new Observable() as SharedA11YObservable;

  let isVoiceOverRunning: () => boolean;
  if (typeof UIAccessibilityIsVoiceOverRunning === 'function') {
    isVoiceOverRunning = UIAccessibilityIsVoiceOverRunning;
  } else {
    if (typeof UIAccessibilityIsVoiceOverRunning !== 'function') {
      writeErrorTrace(`UIAccessibilityIsVoiceOverRunning() - is not a function`);

      isVoiceOverRunning = () => false;
    }
  }

  sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isVoiceOverRunning());

  let voiceOverStatusChangedNotificationName: string | null = null;

  if (typeof UIAccessibilityVoiceOverStatusDidChangeNotification !== 'undefined') {
    voiceOverStatusChangedNotificationName = UIAccessibilityVoiceOverStatusDidChangeNotification;
  } else if (typeof UIAccessibilityVoiceOverStatusChanged !== 'undefined') {
    voiceOverStatusChangedNotificationName = UIAccessibilityVoiceOverStatusChanged;
  }

  if (voiceOverStatusChangedNotificationName) {
    nativeObserver = nsApp.ios.addNotificationObserver(voiceOverStatusChangedNotificationName, () => {
      if (sharedA11YObservable) {
        sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isVoiceOverRunning());
      }
    });

    nsApp.on(nsApp.exitEvent, () => {
      if (nativeObserver) {
        nsApp.ios.removeNotificationObserver(nativeObserver, voiceOverStatusChangedNotificationName);
      }

      nativeObserver = null;
      if (sharedA11YObservable) {
        sharedA11YObservable.removeEventListener(Observable.propertyChangeEvent);
        sharedA11YObservable = null;
      }
    });
  }

  nsApp.on(nsApp.resumeEvent, () => sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isVoiceOverRunning()));

  return sharedA11YObservable;
}

export class AccessibilityServiceEnabledObservable extends CommonA11YServiceEnabledObservable {
  constructor() {
    super(getSharedA11YObservable());
  }
}

export * from '@nativescript/core/utils/utils';
