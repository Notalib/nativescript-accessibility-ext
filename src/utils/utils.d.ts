import * as utils from 'tns-core-modules/utils/utils';
export declare function isAccessibilityServiceEnabled(): boolean;
export { utils };
import { Observable } from 'tns-core-modules/data/observable';

export class AccessibilityServiceEnabledObservable extends Observable {
  accessibilityServiceEnabled: boolean;
}
