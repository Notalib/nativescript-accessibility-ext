import { Application, ApplicationEventData, Observable, Utils } from '@nativescript/core';
import { isTraceEnabled, writeTrace } from '../trace';
import { AccessibilityServiceEnabledPropName, CommonA11YServiceEnabledObservable, SharedA11YObservable as CommonSharedA11YObservable } from './utils-common';

type AccessibilityManagerCompat = androidx.core.view.accessibility.AccessibilityManagerCompat;
const AccessibilityManagerCompat = androidx.core.view.accessibility.AccessibilityManagerCompat;
type TouchExplorationStateChangeListener = androidx.core.view.accessibility.AccessibilityManagerCompat.TouchExplorationStateChangeListener;
const TouchExplorationStateChangeListener = androidx.core.view.accessibility.AccessibilityManagerCompat.TouchExplorationStateChangeListener;
type AccessibilityStateChangeListener = androidx.core.view.accessibility.AccessibilityManagerCompat.AccessibilityStateChangeListener;
const AccessibilityStateChangeListener = androidx.core.view.accessibility.AccessibilityManagerCompat.AccessibilityStateChangeListener;

type AccessibilityManager = android.view.accessibility.AccessibilityManager;
const AccessibilityManager = android.view.accessibility.AccessibilityManager;

function getA11YManager() {
  const cls = `getA11YManager()`;

  const context = Utils.ad.getApplicationContext() as android.content.Context;
  if (!context) {
    if (isTraceEnabled()) {
      writeTrace(`${cls}: no context`);
    }

    return null;
  }

  return context.getSystemService(android.content.Context.ACCESSIBILITY_SERVICE) as AccessibilityManager;
}

interface SharedA11YObservable extends CommonSharedA11YObservable {
  a11yStateEnabled?: boolean;
  touchExplorationStateEnabled?: boolean;
}

let accessibilityStateChangeListener: AccessibilityStateChangeListener;
let touchExplorationStateChangeListener: TouchExplorationStateChangeListener;
let sharedA11YObservable: SharedA11YObservable;

const A11yStateEnabledPropName = 'a11yStateEnabled';
const TouchExplorationStateEnabledPropName = 'touchExplorationStateEnabled';

function updateState() {
  const a11yManager = getA11YManager();
  if (!a11yManager) {
    return;
  }

  sharedA11YObservable.set(A11yStateEnabledPropName, !!a11yManager.isEnabled());
  sharedA11YObservable.set(TouchExplorationStateEnabledPropName, !!a11yManager.isTouchExplorationEnabled());
}

function ensureStateListener(): SharedA11YObservable {
  if (accessibilityStateChangeListener) {
    return sharedA11YObservable;
  }

  const a11yManager = getA11YManager();
  sharedA11YObservable = new Observable() as SharedA11YObservable;
  Object.defineProperty(sharedA11YObservable, AccessibilityServiceEnabledPropName, {
    get(this: SharedA11YObservable) {
      return !!this[A11yStateEnabledPropName] && !!this[TouchExplorationStateEnabledPropName];
    },
  });

  if (!a11yManager) {
    sharedA11YObservable.set(A11yStateEnabledPropName, false);
    sharedA11YObservable.set(TouchExplorationStateEnabledPropName, false);

    return sharedA11YObservable;
  }

  accessibilityStateChangeListener = new AccessibilityStateChangeListener({
    onAccessibilityStateChanged(enabled) {
      updateState();

      if (isTraceEnabled()) {
        writeTrace(`AccessibilityStateChangeListener state changed to: ${!!enabled}`);
      }
    },
  });

  touchExplorationStateChangeListener = new TouchExplorationStateChangeListener({
    onTouchExplorationStateChanged(enabled) {
      updateState();

      if (isTraceEnabled()) {
        writeTrace(`TouchExplorationStateChangeListener state changed to: ${!!enabled}`);
      }
    },
  });

  AccessibilityManagerCompat.addAccessibilityStateChangeListener(a11yManager, accessibilityStateChangeListener);
  AccessibilityManagerCompat.addTouchExplorationStateChangeListener(a11yManager, touchExplorationStateChangeListener);

  updateState();

  Application.on(Application.resumeEvent, updateState);

  return sharedA11YObservable;
}

export function isAccessibilityServiceEnabled() {
  return ensureStateListener().accessibilityServiceEnabled;
}

Application.on(Application.exitEvent, (args: ApplicationEventData) => {
  const activity = args.android as android.app.Activity;
  if (activity && !activity.isFinishing()) {
    return;
  }

  const a11yManager = getA11YManager();
  if (a11yManager) {
    if (accessibilityStateChangeListener) {
      a11yManager.removeAccessibilityStateChangeListener(accessibilityStateChangeListener);
    }

    if (touchExplorationStateChangeListener) {
      a11yManager.removeTouchExplorationStateChangeListener(touchExplorationStateChangeListener);
    }
  }

  accessibilityStateChangeListener = null;
  touchExplorationStateChangeListener = null;

  if (sharedA11YObservable) {
    sharedA11YObservable.removeEventListener(Observable.propertyChangeEvent);
    sharedA11YObservable = null;
  }

  Application.off(Application.resumeEvent, updateState);
});

export class AccessibilityServiceEnabledObservable extends CommonA11YServiceEnabledObservable {
  constructor() {
    super(ensureStateListener());
  }
}

export * from '@nativescript/core/utils/utils';
