import * as utils from 'tns-core-modules/utils/utils';

import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { writeTrace } from './helpers';

declare module 'tns-core-modules/utils/utils' {
  export function isAccessibilityEnabled(): boolean;
}

function isAccessibilityEnabled(): boolean {
  let isEnabled: boolean;
  if (isAndroid) {
    const context = utils.ad.getApplicationContext();
    if (!context) {
      writeTrace(`isAccessibilityEnabled().android: no context`);
      return false;
    }

    const a11yService = <android.view.accessibility.AccessibilityManager>context.getSystemService(android.content.Context.ACCESSIBILITY_SERVICE);
    if (!a11yService) {
      writeTrace(`isAccessibilityEnabled().android: no a11yService`);
      return false;
    }
    isEnabled = a11yService.isEnabled();
    writeTrace(`isAccessibilityEnabled().android: isEnabled:${isEnabled}`);
  } else if (isIOS) {
    isEnabled = UIAccessibilityIsVoiceOverRunning();
    writeTrace(`isAccessibilityEnabled().ios: isEnabled:${isEnabled}`);
  } else {
    throw new Error('isAccessibilityEnabled().ios: unknown platform');
  }

  return isEnabled;
};

Object.defineProperty(utils, 'isAccessibilityEnabled', {
  value: isAccessibilityEnabled,
});

export {
  utils,
};
