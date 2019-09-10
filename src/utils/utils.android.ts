import * as nsApp from 'tns-core-modules/application';
import { Observable } from 'tns-core-modules/data/observable';
import * as utils from 'tns-core-modules/utils/utils';
import { isTraceEnabled, writeTrace } from '../trace';
import { CommonA11YServiceEnabledObservable } from './utils-common';

export * from 'tns-core-modules/utils/utils';

type AccessibilityManagerCompat = android.support.v4.view.accessibility.AccessibilityManagerCompat;
const AccessibilityManagerCompat = android.support.v4.view.accessibility.AccessibilityManagerCompat;
type TouchExplorationStateChangeListener = android.support.v4.view.accessibility.AccessibilityManagerCompat.TouchExplorationStateChangeListener;
const TouchExplorationStateChangeListener = android.support.v4.view.accessibility.AccessibilityManagerCompat.TouchExplorationStateChangeListener;
type AccessibilityStateChangeListener = android.support.v4.view.accessibility.AccessibilityManagerCompat.AccessibilityStateChangeListener;
const AccessibilityStateChangeListener = android.support.v4.view.accessibility.AccessibilityManagerCompat.AccessibilityStateChangeListener;

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

interface SharedA11YObservable extends Observable {
  a11yStateEnabled?: boolean;
  touchExplorationStateEnabled?: boolean;
  readonly accessibilityServiceEnabled?: boolean;
}
let accessibilityStateChangeListener: AccessibilityStateChangeListener;
let touchExplorationStateChangeListener: TouchExplorationStateChangeListener;
let sharedA11YObservable: SharedA11YObservable;

function ensureStateListener() {
  if (accessibilityStateChangeListener) {
    return;
  }

  const a11yManager = getA11YManager();
  sharedA11YObservable = new Observable() as SharedA11YObservable;
  Object.defineProperty(sharedA11YObservable, 'accessibilityServiceEnabled', {
    get() {
      return this['a11yStateEnabled'] || this['touchExplorationStateEnabled'];
    },
  });

  if (!a11yManager) {
    sharedA11YObservable.a11yStateEnabled = false;
    sharedA11YObservable.touchExplorationStateEnabled = false;
    return;
  }

  accessibilityStateChangeListener = new AccessibilityStateChangeListener({
    onAccessibilityStateChanged(enabled) {
      sharedA11YObservable.set('a11yStateEnabled', !!enabled);

      if (isTraceEnabled()) {
        writeTrace(`AccessibilityStateChangeListener state changed to: ${!!enabled}`);
      }
    },
  });

  touchExplorationStateChangeListener = new TouchExplorationStateChangeListener({
    onTouchExplorationStateChanged(enabled) {
      sharedA11YObservable.set('touchExplorationStateEnabled', !!enabled);

      if (isTraceEnabled()) {
        writeTrace(`TouchExplorationStateChangeListener state changed to: ${!!enabled}`);
      }
    },
  });

  AccessibilityManagerCompat.addAccessibilityStateChangeListener(a11yManager, accessibilityStateChangeListener);
  AccessibilityManagerCompat.addTouchExplorationStateChangeListener(a11yManager, touchExplorationStateChangeListener);

  if (AccessibilityManagerCompat.isTouchExplorationEnabled(a11yManager)) {
    sharedA11YObservable.set('a11yStateEnabled', true);
    sharedA11YObservable.set('touchExplorationStateEnabled', true);
  } else {
    sharedA11YObservable.set('a11yStateEnabled', false);
    sharedA11YObservable.set('touchExplorationStateEnabled', false);
  }
}

export function isAccessibilityServiceEnabled(): boolean {
  ensureStateListener();

  return !!sharedA11YObservable.accessibilityServiceEnabled;
}

nsApp.on(nsApp.exitEvent, () => {
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
  }
});

export class AccessibilityServiceEnabledObservable extends CommonA11YServiceEnabledObservable {
  public get accessibilityServiceEnabled() {
    return sharedA11YObservable && !!sharedA11YObservable.accessibilityServiceEnabled;
  }
  public set accessibilityServiceEnabled(v) {
    // ignore
  }

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

      const newValue = self.accessibilityServiceEnabled;
      if (newValue !== lastValue) {
        self.set('accessibilityServiceEnabled', newValue);
        lastValue = newValue;
      }
    });
  }
}
