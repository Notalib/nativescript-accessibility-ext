import * as utils from '@nativescript/core';
export declare function isAccessibilityServiceEnabled(): boolean;
export { utils };
import { Observable } from '@nativescript/core';

export class AccessibilityServiceEnabledObservable extends Observable {
  accessibilityServiceEnabled: boolean;
}
