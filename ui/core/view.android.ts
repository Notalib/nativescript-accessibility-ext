/// <reference path="../../node_modules/tns-platform-declarations/tns-core-modules/android17.d.ts" />

import * as common from './view-common';
import {View} from 'ui/core/view';
import * as proxy from 'ui/core/proxy';
import {PropertyChangeData} from 'ui/core/dependency-observable';

function onImportantForAccessibilityChanged(data: PropertyChangeData) {
  const view = <android.view.View>(<any>data.object)._nativeView;
  const value = data.newValue;
  const oldValue = data.oldValue

  if (!value) {
    view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
    return;
  }

  switch (value.toLowerCase()) {
    case 'no-hide-descendants': {
      // TODO: This required android api-level 19, how to detect?
      view.setImportantForAccessibility((<any>android.view.View).IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
      break;
    }
    case 'yes': {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES);
      break;
    }
    case 'no': {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO);
      break;
    }
    default: {
      view.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
    }
  }
}

(<proxy.PropertyMetadata>(<any>common.View).importantForAccessibilityProperty.metadata).onSetNativeValue = onImportantForAccessibilityChanged;
(<proxy.PropertyMetadata>(<any>common.View).importantForAccessibilityProperty.metadata).onValueChanged = onImportantForAccessibilityChanged;
