import * as utils from 'tns-core-modules/utils/utils';
import { writeTrace } from './helpers';

export * from 'tns-core-modules/utils/utils';

export function isAccessibilityServiceEnabled(): boolean {
  const cls = `isAccessibilityServiceEnabled<android>()`;
  const context = utils.ad.getApplicationContext() as android.content.Context;
  if (!context) {
    writeTrace(`${cls}: no context`);
    return false;
  }

  const a11yManager = context.getSystemService(android.content.Context.ACCESSIBILITY_SERVICE) as android.view.accessibility.AccessibilityManager;
  if (!a11yManager) {
    writeTrace(`${cls}: no a11yService`);
    return false;
  }

  const isEnabled = android.support.v4.view.accessibility.AccessibilityManagerCompat.isTouchExplorationEnabled(a11yManager);
  writeTrace(`${cls}: isEnabled:${isEnabled}`);

  return isEnabled;
}
