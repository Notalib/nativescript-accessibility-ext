import * as utils from "tns-core-modules/utils/utils";
export * from "tns-core-modules/utils/utils";

import { writeTrace } from "./helpers";

export function isAccessibilityServiceEnabled(): boolean {
  const context = utils.ad.getApplicationContext();
  if (!context) {
    writeTrace(`isAccessibilityServiceEnabled().android: no context`);
    return false;
  }

  const a11yManager = <android.view.accessibility.AccessibilityManager>(
    context.getSystemService(android.content.Context.ACCESSIBILITY_SERVICE)
  );
  if (!a11yManager) {
    writeTrace(`isAccessibilityServiceEnabled().android: no a11yService`);
    return false;
  }
  const isEnabled = android.support.v4.view.accessibility.AccessibilityManagerCompat.isTouchExplorationEnabled(
    a11yManager
  );
  writeTrace(`isAccessibilityServiceEnabled().android: isEnabled:${isEnabled}`);

  return isEnabled;
}
