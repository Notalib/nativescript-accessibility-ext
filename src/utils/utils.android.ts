import * as nsApp from '@nativescript/core/application';
import { Observable } from '@nativescript/core/data/observable';
import * as utils from '@nativescript/core/utils/utils';
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

  const context = utils.ad.getApplicationContext() as android.content.Context;
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

function ensureStateListener() {
  if (accessibilityStateChangeListener) {
    return sharedA11YObservable;
  }

  const a11yManager = getA11YManager();
  sharedA11YObservable = new Observable() as SharedA11YObservable;
  Object.defineProperty(sharedA11YObservable, AccessibilityServiceEnabledPropName, {
    get(this: SharedA11YObservable) {
      return this[A11yStateEnabledPropName] && this[TouchExplorationStateEnabledPropName];
    },
  });

  if (!a11yManager) {
    sharedA11YObservable.set(A11yStateEnabledPropName, false);
    sharedA11YObservable.set(TouchExplorationStateEnabledPropName, false);

    return sharedA11YObservable;
  }

  accessibilityStateChangeListener = new AccessibilityStateChangeListener({
    onAccessibilityStateChanged(enabled) {
      sharedA11YObservable.set(A11yStateEnabledPropName, !!enabled);

      if (isTraceEnabled()) {
        writeTrace(`AccessibilityStateChangeListener state changed to: ${!!enabled}`);
      }
    },
  });

  touchExplorationStateChangeListener = new TouchExplorationStateChangeListener({
    onTouchExplorationStateChanged(enabled) {
      sharedA11YObservable.set(TouchExplorationStateEnabledPropName, !!enabled);
      if (isTraceEnabled()) {
        writeTrace(`TouchExplorationStateChangeListener state changed to: ${!!enabled}`);
      }
    },
  });

  AccessibilityManagerCompat.addAccessibilityStateChangeListener(a11yManager, accessibilityStateChangeListener);
  AccessibilityManagerCompat.addTouchExplorationStateChangeListener(a11yManager, touchExplorationStateChangeListener);

  if (AccessibilityManagerCompat.isTouchExplorationEnabled(a11yManager)) {
    sharedA11YObservable.set(A11yStateEnabledPropName, true);
    sharedA11YObservable.set(TouchExplorationStateEnabledPropName, true);
  } else {
    sharedA11YObservable.set(A11yStateEnabledPropName, false);
    sharedA11YObservable.set(TouchExplorationStateEnabledPropName, false);
  }

  return sharedA11YObservable;
}

export function isAccessibilityServiceEnabled() {
  ensureStateListener();

  return !!sharedA11YObservable.accessibilityServiceEnabled;
}

nsApp.on(nsApp.exitEvent, (args: nsApp.ApplicationEventData) => {
  const activity = args.android as android.app.Activity;
  if (activity && !activity.isFinishing()) {
    return;
  }

  const a11yManager = getA11YManager();
  if (a11yManager) {
    if (accessibilityStateChangeListener) {
      AccessibilityManagerCompat.removeAccessibilityStateChangeListener(a11yManager, accessibilityStateChangeListener);
    }

    if (touchExplorationStateChangeListener) {
      AccessibilityManagerCompat.removeTouchExplorationStateChangeListener(a11yManager, touchExplorationStateChangeListener);
    }
  }

  accessibilityStateChangeListener = null;
  touchExplorationStateChangeListener = null;
  if (sharedA11YObservable) {
    sharedA11YObservable.removeEventListener(Observable.propertyChangeEvent);
    sharedA11YObservable = null;
  }
});

export class AccessibilityServiceEnabledObservable extends CommonA11YServiceEnabledObservable {
  constructor() {
    super(ensureStateListener());
  }
}

export * from '@nativescript/core/utils/utils';
