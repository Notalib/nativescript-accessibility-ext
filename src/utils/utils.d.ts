import * as utils from '@nativescript/core/utils/utils';
export declare function isAccessibilityServiceEnabled(): boolean;
export { utils };
import { Observable } from '@nativescript/core/data/observable';

export class AccessibilityServiceEnabledObservable extends Observable {
  accessibilityServiceEnabled: boolean;
}
