import * as common from './label-common';
import { Observable, PropertyChangeData } from 'data/observable';
import { PropertyChangeData as ViewPropertyChangeData } from 'ui/core/dependency-observable';
import { Font } from 'ui/styling/font';
import * as utils from 'utils/utils';

import { FontScaleObservable } from '../../utils/FontScaleObservable';

function tnsLabelToUILabel(view: any): UILabel {
  return <UILabel>view._nativeView;
}

import { setNativeValueFn } from '../../utils/helpers';

// Define the android specific properties with a noop function
for (const propertyName of common.androidProperties) {
  setNativeValueFn(common.Label, propertyName);
}

setNativeValueFn(common.Label, 'accessibilityAdjustFontSize', function onAccessiblityAdjustFontSize(data: ViewPropertyChangeData) {
  const tnsLabel = <common.Label>data.object;
  const uiLabel = tnsLabelToUILabel(tnsLabel);
  const value = data.newValue;

  const fontScaleProp = '_a11yFontScaleObservable';

  if (fontScaleProp in tnsLabel) {
    if (value) {
      return;
    }

    tnsLabel[fontScaleProp].off(Observable.propertyChangeEvent);
    tnsLabel[fontScaleProp] = undefined;
    return;
  }

  let timer: any;
  const updateFontSize = () => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      const oldFont = <Font>tnsLabel.style.get('_fontInternal');
      const fontScale = tnsLabel[fontScaleProp].get(FontScaleObservable.FONT_SCALE);
      if (!fontScale) {
        return;
      }

      const newFontSize = oldFont.fontSize * fontScale;
      console.log(JSON.stringify({
        fontScale,
        newFontSize,
        oldFontSize: oldFont.fontSize,
      }));

      const oldUIFont = (<any>oldFont)._uiFont || UIFont.systemFontOfSize(utils.ios.getter(UIFont, UIFont.labelFontSize));

      const newFont = new Font(oldFont.fontFamily, newFontSize, oldFont.fontStyle, oldFont.fontWeight);

      uiLabel.font = newFont.getUIFont(oldUIFont);
      tnsLabel.requestLayout();
    }, 5);
  };

  const styleCb = (args: PropertyChangeData) => {
    if (!tnsLabel.accessibilityAdjustFontSize) {
      tnsLabel.style.off(Observable.propertyChangeEvent, styleCb);
      return;
    }

    updateFontSize();
  };

  tnsLabel.style.on(Observable.propertyChangeEvent, styleCb);

  tnsLabel[fontScaleProp] = new FontScaleObservable();

  tnsLabel[fontScaleProp].on(Observable.propertyChangeEvent, (args: PropertyChangeData) => {
    if (args.propertyName === FontScaleObservable.FONT_SCALE) {
      updateFontSize();
    }
  });

  tnsLabel.on('unloaded', () => {
    tnsLabel[fontScaleProp].off(Observable.propertyChangeEvent);
  });

  updateFontSize();
});
