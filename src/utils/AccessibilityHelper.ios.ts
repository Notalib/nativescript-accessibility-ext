import * as nsApp from '@nativescript/core/application';
import { profile } from '@nativescript/core/profiling';
import { View as TNSView } from '@nativescript/core/ui/core/view';
import { ProxyViewContainer } from '@nativescript/core/ui/proxy-view-container';
import { AccessibilityLiveRegion, AccessibilityRole, AccessibilityState, AccessibilityTrait } from '../ui/core/view-common';
import { hmrSafeEvents, inputArrayToBitMask, notifyAccessibilityFocusState } from './helpers';

export function getAndroidView<T extends android.view.View>(tnsView: TNSView): T {
  throw new Error(`getAndroidView(${tnsView}) - should never be called on iOS`);
}

export function getUIView<T extends UIView>(view: TNSView): T {
  return view.ios;
}

let AccessibilityTraitsMap: Map<string, number>;
let RoleTypeMap: Map<AccessibilityRole, number>;

let nativeFocusedNotificationObserver: any;
const uiViewToTnsView = new WeakMap<UIView, WeakRef<TNSView>>();
let lastFocusedView: WeakRef<TNSView>;
function ensureNativeClasses() {
  if (AccessibilityTraitsMap && nativeFocusedNotificationObserver) {
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
    [AccessibilityRole.Header, UIAccessibilityTraitHeader],
    [AccessibilityRole.Link, UIAccessibilityTraitLink],
    [AccessibilityRole.Search, UIAccessibilityTraitSearchField],
    [AccessibilityRole.Image, UIAccessibilityTraitImage],
    [AccessibilityRole.ImageButton, UIAccessibilityTraitImage | UIAccessibilityTraitButton],
    [AccessibilityRole.KeyboardKey, UIAccessibilityTraitKeyboardKey],
    [AccessibilityRole.StaticText, UIAccessibilityTraitStaticText],
    [AccessibilityRole.Summary, UIAccessibilityTraitSummaryElement],
    [AccessibilityRole.Adjustable, UIAccessibilityTraitAdjustable],
    [AccessibilityRole.Checkbox, UIAccessibilityTraitButton],
    [AccessibilityRole.Switch, UIAccessibilityTraitButton],
    [AccessibilityRole.RadioButton, UIAccessibilityTraitButton],
  ]);

  nativeFocusedNotificationObserver = nsApp.ios.addNotificationObserver(UIAccessibilityElementFocusedNotification, (args: NSNotification) => {
    const uiView = args.userInfo.objectForKey(UIAccessibilityFocusedElementKey) as UIView;

    const tnsView = uiViewToTnsView.has(uiView) ? uiViewToTnsView.get(uiView).get() : null;
    if (!tnsView) {
      return;
    }

    const lastView = lastFocusedView && lastFocusedView.get();
    if (lastView && tnsView !== lastView) {
      const lastFocusedUIView = getUIView(lastView);
      if (lastFocusedUIView) {
        lastFocusedView = null;

        notifyAccessibilityFocusState(lastView, false, true);
      }
    }

    lastFocusedView = new WeakRef(tnsView);

    notifyAccessibilityFocusState(tnsView, true, false);
  });

  nsApp.on(nsApp.exitEvent, () => {
    if (nativeFocusedNotificationObserver) {
      nsApp.ios.removeNotificationObserver(nativeFocusedNotificationObserver, UIAccessibilityElementFocusedNotification);
    }

    nativeFocusedNotificationObserver = null;
  });
}

export class AccessibilityHelper {
  @profile
  public static updateAccessibilityProperties(tnsView: TNSView) {
    if (tnsView instanceof ProxyViewContainer) {
      return;
    }

    const uiView = getUIView(tnsView);
    if (!uiView) {
      return;
    }

    ensureNativeClasses();

    const accessibilityRole = tnsView.accessibilityRole as AccessibilityRole;
    const accessibilityState = tnsView.accessibilityState as AccessibilityState;

    if (!tnsView.accessible || tnsView.accessibilityHidden) {
      uiView.accessibilityTraits = UIAccessibilityTraitNone;

      return;
    }

    let a11yTraits = UIAccessibilityTraitNone;
    if (RoleTypeMap.has(accessibilityRole)) {
      a11yTraits |= RoleTypeMap.get(accessibilityRole);
    }

    switch (accessibilityRole) {
      case AccessibilityRole.Checkbox:
      case AccessibilityRole.RadioButton:
      case AccessibilityRole.Switch: {
        if (accessibilityState === AccessibilityState.Checked) {
          a11yTraits |= AccessibilityTraitsMap.get(AccessibilityTrait.Selected);
        }
        break;
      }
      default: {
        if (accessibilityState === AccessibilityState.Selected) {
          a11yTraits |= AccessibilityTraitsMap.get(AccessibilityTrait.Selected);
        }
        if (accessibilityState === AccessibilityState.Disabled) {
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
        a11yTraits &= ~UpdatesFrequentlyTrait;
        break;
      }
    }

    if (tnsView.accessibilityMediaSession) {
      a11yTraits |= AccessibilityTraitsMap.get(AccessibilityTrait.StartsMediaSession);
    }

    if (tnsView.accessibilityTraits) {
      a11yTraits |= inputArrayToBitMask(tnsView.accessibilityTraits, AccessibilityTraitsMap);
    }

    uiView.accessibilityTraits = a11yTraits;
  }

  public static sendAccessibilityEvent(tnsView: TNSView, eventName: string, text?: string): void {
    throw new Error('AccessibilityHelper.sendAccessibilityEvent() - Should never be called on iOS');
  }

  public static updateContentDescription(tnsView: TNSView, forceUpdate?: boolean): string {
    throw new Error('AccessibilityHelper.updateContentDescription() . Should never be called on iOS');
  }
}

hmrSafeEvents('A11YHelper:loadedEvent', [TNSView.loadedEvent], TNSView, function (this: null, evt) {
  const tnsView = evt.object;
  if (!tnsView) {
    return;
  }

  if (tnsView instanceof ProxyViewContainer) {
    return;
  }

  const uiView = getUIView(tnsView);
  if (!uiView) {
    return;
  }

  uiViewToTnsView.set(uiView, new WeakRef(tnsView));
});
