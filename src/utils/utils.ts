import * as utils from 'tns-core-modules/utils/utils';

import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { writeTrace } from './helpers';

declare module 'tns-core-modules/utils/utils' {
  export function isAccessbilityEnabled(): boolean;
}

function isAccessbilityEnabled(): boolean {
  let isEnabled: boolean;
  if (isAndroid) {
    const context = utils.ad.getApplicationContext();
    if (!context) {
      writeTrace(`isAccessbilityEnabled().android: no context`);
      return false;
    }

    const a11yService = <android.view.accessibility.AccessibilityManager>context.getSystemService(android.content.Context.ACCESSIBILITY_SERVICE);
    isEnabled = a11yService.isEnabled();
    writeTrace(`isAccessbilityEnabled().android: isEnabled:${isEnabled}`);
  } else if (isIOS) {
    isEnabled = UIAccessibilityIsVoiceOverRunning();
    writeTrace(`isAccessbilityEnabled().ios: isEnabled:${isEnabled}`);
  } else {
    throw new Error('isAccessbilityEnabled().ios: unknown platform');
  }

  return isEnabled;
};

Object.defineProperty(utils, 'isAccessbilityEnabled', {
  value: isAccessbilityEnabled,
});

export {
  utils,
};
