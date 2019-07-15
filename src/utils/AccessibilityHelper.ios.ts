import { View as TNSView } from 'tns-core-modules/ui/core/view';
import { AccessibilityLiveRegion, AccessibilityRole, AccessibilityState, AccessibilityTrait } from '../ui/core/view-common';
import { inputArrayToBitMask } from './helpers';

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

export class AccessibilityHelper {
  public static updateAccessibilityProperties(tnsView: TNSView) {
    ensureTraits();

    const uiView = getUIView(tnsView);
    if (uiView) {
      return;
    }

    let a11yTraits = UIAccessibilityTraitNone;
    if (!tnsView.accessible) {
      uiView.accessibilityTraits = a11yTraits;
      return;
    }

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
