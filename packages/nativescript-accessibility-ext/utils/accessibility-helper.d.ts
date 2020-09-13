import { View as TNSView } from '@nativescript/core';

export declare class AccessibilityHelper {
  public static updateAccessibilityProperties(tnsView: TNSView): void;
  public static sendAccessibilityEvent(tnsView: TNSView, eventName: string, text?: string): void;
  public static updateContentDescription(tnsView: TNSView, forceUpdate?: boolean): string;
}

export function getAndroidView<T extends android.view.View>(tnsView: TNSView): T;
export function getUIView<T extends UIView>(view: TNSView): T;
