import * as utils from 'tns-core-modules/utils/utils';
export * from 'tns-core-modules/utils/utils';

import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { writeTrace } from './helpers';

declare module 'tns-core-modules/utils/utils' {
  /**
   * Is the the accessibility service enabled?
   * Usually TalkBack on Android and VoiceOver on iOS
   */
  export function isAccessibilityServiceEnabled(): boolean;
}

export function isAccessibilityServiceEnabled(): boolean {
  let isEnabled: boolean;
  if (isAndroid) {
    const context = utils.ad.getApplicationContext();
    if (!context) {
      writeTrace(`isAccessibilityServiceEnabled().android: no context`);
      return false;
    }

    const a11yService = <android.view.accessibility.AccessibilityManager>context.getSystemService(android.content.Context.ACCESSIBILITY_SERVICE);
    if (!a11yService) {
      writeTrace(`isAccessibilityServiceEnabled().android: no a11yService`);
      return false;
    }
    isEnabled = a11yService.isEnabled();
    writeTrace(`isAccessibilityServiceEnabled().android: isEnabled:${isEnabled}`);
  } else if (isIOS) {
    isEnabled = UIAccessibilityIsVoiceOverRunning();
    writeTrace(`isAccessibilityServiceEnabled().ios: isEnabled:${isEnabled}`);
  } else {
    throw new Error('isAccessibilityServiceEnabled().ios: unknown platform');
  }

  return isEnabled;
};

Object.defineProperty(utils, 'isAccessibilityServiceEnabled', {
  value: isAccessibilityServiceEnabled,
});
