import * as nsApp from 'tns-core-modules/application';
import { View as TNSView } from 'tns-core-modules/ui/core/view';
import { isTraceEnabled, writeTrace } from 'trace';
import { AccessibilityLiveRegion, AccessibilityRole, AccessibilityState, AccessibilityTrait } from '../ui/core/view-common';
import { inputArrayToBitMask, notifyAccessibilityFocusState } from './helpers';

export function getAndroidView<T extends android.view.View>(tnsView: TNSView): T {
  throw new Error(`getAndroidView(${tnsView}) - should never be called on iOS`);
}

export function getViewCompat() {
  throw new Error(`getViewCompat() - should never be called on iOS`);
}

export function getUIView<T extends UIView>(view: TNSView): T {
  return view.ios;
}

let AccessibilityTraitsMap: Map<string, number>;
let RoleTypeMap: Map<string, number>;
function ensureTraits() {
  if (AccessibilityTraitsMap) {
    return;
  }

  AccessibilityTraitsMap = new Map<AccessibilityTrait, number>([
    [AccessibilityTrait.None, UIAccessibilityTraitNone],
    [AccessibilityTrait.Button, UIAccessibilityTraitButton],
    [AccessibilityTrait.Link, UIAccessibilityTraitLink],
    [AccessibilityTrait.SearchField, UIAccessibilityTraitSearchField],
    [AccessibilityTrait.Image, UIAccessibilityTraitImage],
    [AccessibilityTrait.Selected, UIAccessibilityTraitSelected],
    [AccessibilityTrait.PlaysSound, UIAccessibilityTraitPlaysSound],
    [AccessibilityTrait.StaticText, UIAccessibilityTraitStaticText],
    [AccessibilityTrait.SummaryElement, UIAccessibilityTraitSummaryElement],
    [AccessibilityTrait.NotEnabled, UIAccessibilityTraitNotEnabled],
    [AccessibilityTrait.UpdatesFrequently, UIAccessibilityTraitUpdatesFrequently],
    [AccessibilityTrait.StartsMediaSession, UIAccessibilityTraitStartsMediaSession],
    [AccessibilityTrait.Adjustable, UIAccessibilityTraitAdjustable],
    [AccessibilityTrait.AllowsDirectInteraction, UIAccessibilityTraitAllowsDirectInteraction],
    [AccessibilityTrait.CausesPageTurn, UIAccessibilityTraitCausesPageTurn],
    [AccessibilityTrait.Header, UIAccessibilityTraitHeader],
  ]);

  RoleTypeMap = new Map<AccessibilityRole, number>([
    [AccessibilityRole.Button, UIAccessibilityTraitButton],
    [AccessibilityRole.Link, UIAccessibilityTraitHeader],
    [AccessibilityRole.Header, UIAccessibilityTraitLink],
    [AccessibilityRole.Search, UIAccessibilityTraitSearchField],
    [AccessibilityRole.Image, UIAccessibilityTraitImage],
    [AccessibilityRole.ImageButton, UIAccessibilityTraitImage | UIAccessibilityTraitButton],
    [AccessibilityRole.KeyboardKey, UIAccessibilityTraitKeyboardKey],
    [AccessibilityRole.StaticText, UIAccessibilityTraitStaticText],
    [AccessibilityRole.Summary, UIAccessibilityTraitSummaryElement],
    [AccessibilityRole.Adjustable, UIAccessibilityTraitAdjustable],
    [AccessibilityRole.Checkbox, UIAccessibilityTraitButton],
    [AccessibilityRole.Switch, UIAccessibilityTraitButton],
  ]);
}
const accessibilityFocusObserverSymbol = Symbol.for('ios:accessibilityFocusObserver');
const accessibilityHadFocusSymbol = Symbol.for('ios:accessibilityHadFocusSymbol');

/**
 * Wrapper for setting up accessibility focus events for iOS9+
 * NOTE: This isn't supported on iOS8
 *
 * If the UIView changes from accessible = true to accessible = false, event will be removed
 *
 * @param {View} tnsView        NativeScript View
 * @param {boolean} isAccessible  is element marked as accessible
 */
function setupAccessibilityFocusEvents(tnsView: TNSView) {
  const cls = `setupAccessibilityFocusEvents(${tnsView}) - accessible = ${tnsView.accessible}`;
  if (typeof UIAccessibilityElementFocusedNotification === 'undefined') {
    if (isTraceEnabled()) {
      writeTrace(`${cls}: not supported by this iOS version`);
    }
    return;
  }

  if (tnsView[accessibilityFocusObserverSymbol]) {
    if (tnsView.accessible) {
      if (isTraceEnabled()) {
        writeTrace(`${cls}: Already configured no need to do so again`);
      }
      return;
    }

    if (isTraceEnabled()) {
      writeTrace(`${cls}: view no longer accessible, remove listener`);
    }
    nsApp.ios.removeNotificationObserver(tnsView[accessibilityFocusObserverSymbol], UIAccessibilityElementFocusedNotification);

    delete tnsView[accessibilityFocusObserverSymbol];
    return;
  }

  if (!tnsView.accessible) {
    return;
  }

  const selfTnsView = new WeakRef<TNSView>(tnsView);

  let observer = nsApp.ios.addNotificationObserver(UIAccessibilityElementFocusedNotification, (args: NSNotification) => {
    const localTnsView = selfTnsView.get();
    if (!localTnsView || !localTnsView.ios) {
      nsApp.ios.removeNotificationObserver(observer, UIAccessibilityElementFocusedNotification);
      observer = null;
      if (localTnsView) {
        delete localTnsView[accessibilityFocusObserverSymbol];
      }

      return;
    }

    const localView = getUIView(localTnsView.ios);

    const object = args.userInfo.objectForKey(UIAccessibilityFocusedElementKey) as UIView;

    const receivedFocus = object === localView;
    const lostFocus = localView[accessibilityHadFocusSymbol] && !receivedFocus;

    if (!receivedFocus && !lostFocus) {
      return;
    }

    if (isTraceEnabled()) {
      writeTrace(`${cls}, view: ${localTnsView}, receivedFocus: ${receivedFocus}, lostFocus: ${lostFocus}`);
    }

    notifyAccessibilityFocusState(localTnsView, receivedFocus, lostFocus);

    if (receivedFocus) {
      localView[accessibilityHadFocusSymbol] = true;
    } else if (lostFocus) {
      localView[accessibilityHadFocusSymbol] = false;
    }
  });

  tnsView[accessibilityFocusObserverSymbol] = observer;
}

export class AccessibilityHelper {
  public static updateAccessibilityProperties(tnsView: TNSView) {
    const uiView = getUIView(tnsView);
    if (!uiView) {
      return;
    }
    ensureTraits();

    setupAccessibilityFocusEvents(tnsView);

    if (!tnsView.accessible) {
      uiView.accessibilityTraits = UIAccessibilityTraitNone;
      return;
    }

    let a11yTraits = UIAccessibilityTraitNone;
    if (RoleTypeMap.has(tnsView.accessibilityRole)) {
      a11yTraits |= RoleTypeMap.get(tnsView.accessibilityRole);
    }

    switch (tnsView.accessibilityRole) {
      case AccessibilityRole.Checkbox:
      case AccessibilityRole.Switch: {
        if (tnsView.accessibilityState === AccessibilityState.Checked) {
          a11yTraits |= AccessibilityTraitsMap.get(AccessibilityTrait.Selected);
        }
        break;
      }
      default: {
        if (tnsView.accessibilityState === AccessibilityState.Selected) {
          a11yTraits |= AccessibilityTraitsMap.get(AccessibilityTrait.Selected);
        }
        if (tnsView.accessibilityState === AccessibilityState.Disabled) {
          a11yTraits |= AccessibilityTraitsMap.get(AccessibilityTrait.NotEnabled);
        }
        break;
      }
    }

    const UpdatesFrequentlyTrait = AccessibilityTraitsMap.get(AccessibilityTrait.UpdatesFrequently);

    switch (tnsView.accessibilityLiveRegion) {
      case AccessibilityLiveRegion.Polite:
      case AccessibilityLiveRegion.Assertive: {
        a11yTraits |= UpdatesFrequentlyTrait;
        break;
      }
      default: {
        if (a11yTraits & UpdatesFrequentlyTrait) {
          a11yTraits ^= UpdatesFrequentlyTrait;
        }
        break;
      }
    }

    if (tnsView.accessibilityTraits) {
      a11yTraits |= inputArrayToBitMask(tnsView.accessibilityTraits, AccessibilityTraitsMap);
    }

    uiView.accessibilityTraits = a11yTraits;
  }

  public static sendAccessibilityEvent() {
    throw new Error('AccessibilityHelper.sendAccessibilityEvent() - Should never be called on iOS');
  }

  public static updateContentDescription() {
    throw new Error('AccessibilityHelper.updateContentDescription() . Should never be called on iOS');
  }
}
