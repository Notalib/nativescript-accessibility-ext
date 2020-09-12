export * from '@nativescript/core/ui/action-bar';
import { ActionBar } from '@nativescript/core';
import { isTraceEnabled, writeTrace } from '../../trace';
import { wrapFunction } from '../../utils';
import { getUIView } from '../../utils/AccessibilityHelper';
import { accessibilityHintProperty, accessibilityLabelProperty, accessibilityLanguageProperty, accessibilityValueProperty } from '../core/view-common';

function updateA11YProperty(tnsView: ActionBar, propName: string, value: string | null | undefined) {
  value = value != null ? `${value}` : null;
  const cls = `ActionBar<${tnsView}.ios>.${propName} = ${value}`;
  const uiView = getUIView(tnsView);
  if (!uiView) {
    if (isTraceEnabled()) {
      writeTrace(`${cls} - no nativeView`);
    }

    return;
  }

  if (isTraceEnabled()) {
    writeTrace(`${cls}`);
  }

  uiView[propName] = value;
  if (!tnsView.page) {
    return;
  }

  const pageNativeView = tnsView.page.ios as UIViewController;
  if (!pageNativeView || !pageNativeView.navigationItem) {
    if (isTraceEnabled()) {
      writeTrace(`${cls} - no page nativeView`);
    }

    return;
  }

  pageNativeView.navigationItem[propName] = value;
}

ActionBar.prototype[accessibilityLabelProperty.setNative] = function accessibilityLabelSetNative(this: ActionBar, label: string | null) {
  if (this.title && label != null) {
    label = `${this.title}. ${label}`;
  }

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

wrapFunction(
  ActionBar.prototype,
  'update',
  function customUpdate() {
    for (const propName of ['accessibilityLabel', 'accessibilityValue', 'accessibilityLanguage', 'accessibilityValue']) {
      updateA11YProperty(this, propName, this[propName]);
    }
  },
  'ActionBar',
);
