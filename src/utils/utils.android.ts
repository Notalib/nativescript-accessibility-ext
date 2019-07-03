import * as nsApp from 'tns-core-modules/application';
import * as utils from 'tns-core-modules/utils/utils';
import { isTraceEnabled, writeTrace } from '../trace';

export * from 'tns-core-modules/utils/utils';

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

let a11yStateEnabled: boolean;
let touchExplorationStateEnabled: boolean;

let accessibilityStateChangeListener: AccessibilityStateChangeListener;
let touchExplorationStateChangeListener: TouchExplorationStateChangeListener;
function ensureStateListener() {
  if (accessibilityStateChangeListener) {
    return;
  }

  const a11yManager = getA11YManager();
  if (!a11yManager) {
    a11yStateEnabled = false;
    touchExplorationStateEnabled = false;
    return;
  }

  accessibilityStateChangeListener = new AccessibilityStateChangeListener({
    onAccessibilityStateChanged(enabled) {
      a11yStateEnabled = enabled;

      if (isTraceEnabled()) {
        writeTrace(`AccessibilityStateChangeListener state changed to: ${!!enabled}`);
      }
    },
  });

  touchExplorationStateChangeListener = new TouchExplorationStateChangeListener({
    onTouchExplorationStateChanged(enabled) {
      touchExplorationStateEnabled = enabled;

      if (isTraceEnabled()) {
        writeTrace(`TouchExplorationStateChangeListener state changed to: ${!!enabled}`);
      }
    },
  });

  AccessibilityManagerCompat.addAccessibilityStateChangeListener(a11yManager, accessibilityStateChangeListener);
  AccessibilityManagerCompat.addTouchExplorationStateChangeListener(a11yManager, touchExplorationStateChangeListener);

  a11yStateEnabled = touchExplorationStateEnabled = AccessibilityManagerCompat.isTouchExplorationEnabled(a11yManager);
}

export function isAccessibilityServiceEnabled(): boolean {
  ensureStateListener();

  return !!a11yStateEnabled && !!touchExplorationStateEnabled;
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
});
