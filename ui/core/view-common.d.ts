import { Property } from 'tns-core-modules/ui/core/view';
export declare const accessibleProperty: Property<any, boolean>;
export declare const accessibilityTraitsProperty: Property<any, string | string[]>;
export declare const accessibilityValueProperty: Property<any, string>;
export declare const accessibilityElementsHidden: Property<any, string>;
export declare const importantForAccessibilityProperty: Property<any, boolean>;
export declare const accessibilityComponentTypeProperty: Property<any, string>;
export declare const accessibilityLiveRegionProperty: Property<any, {}>;
export declare const commenFunctions: {
    'accessibilityAnnouncement': string;
};
export declare const iosFunctions: {
    'postAccessibilityNotification': string;
};
export declare const androidFunctions: {
    'sendAccessibilityEvent': string;
};
export declare const allFunctions: {
    'accessibilityAnnouncement': string;
} & {
    'postAccessibilityNotification': string;
} & {
    'sendAccessibilityEvent': string;
};
export { ViewCommon } from 'tns-core-modules/ui/core/view/view-common';
