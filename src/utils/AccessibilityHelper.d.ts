import { View } from 'tns-core-modules/ui/core/view';

export declare class AccessibilityHelper {
  public static updateAccessibilityComponentType(tnsView: View): void;
  public static removeAccessibilityComponentType(tnsView: View): void;
  public static sendAccessibilityEvent(androidView: android.view.View, eventName: string, text?: string): void;
  public static updateContentDescription(tnsView: View, androidView: android.view.View): void;
}

export function getAndroidView(view: View): android.view.View;
export function getViewCompat(): typeof androidx.core.view.ViewCompat;