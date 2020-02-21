export * from '@nativescript/core/ui/action-bar/action-bar';
import { ActionBar } from '@nativescript/core/ui/action-bar/action-bar';
import { isTraceEnabled, writeTrace } from '../../trace';
import { getUIView } from '../../utils/AccessibilityHelper';
import { accessibilityHintProperty, accessibilityLabelProperty, accessibilityLanguageProperty, accessibilityValueProperty } from '../core/view-common';

function updateA11YProperty(tnsView: ActionBar, propName: string, value: string | null) {
  const uiView = getUIView(tnsView);
  if (!uiView) {
    return;
  }

  value = value != null ? `${value}` : null;

  const cls = `ActionBar<${this}.ios>.${propName} = ${value}`;
  if (isTraceEnabled()) {
    writeTrace(`${cls}`);
  }

  uiView[propName] = value;
  if (!tnsView.page) {
    return;
  }

  const pageNativeView = tnsView.page.ios as UIViewController;
  if (!pageNativeView || !pageNativeView.navigationItem) {
    return;
  }

  pageNativeView.navigationItem[propName] = value;
}

ActionBar.prototype[accessibilityLabelProperty.setNative] = function accessibilityLabelSetNative(this: ActionBar, label: string | null) {
  updateA11YProperty(this, 'accessibilityLabel', label);
};

ActionBar.prototype[accessibilityValueProperty.setNative] = function accessibilityValueSetNative(this: ActionBar, value: string) {
  updateA11YProperty(this, 'accessibilityValue', value);
};

ActionBar.prototype[accessibilityHintProperty.setNative] = function accessibilityHintSetNative(this: ActionBar, hint: string) {
  updateA11YProperty(this, 'accessibilityValue', hint);
};

ActionBar.prototype[accessibilityLanguageProperty.setNative] = function accessibilityLanguageSetNative(this: ActionBar, lang: string) {
  updateA11YProperty(this, 'accessibilityLanguage', lang);
};
