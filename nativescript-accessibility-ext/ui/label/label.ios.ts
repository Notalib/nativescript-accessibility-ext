import * as common from './label-common';
import { Observable, PropertyChangeData } from 'data/observable';
import { PropertyChangeData as ViewPropertyChangeData } from 'ui/core/dependency-observable';
import { Font } from 'ui/styling/font';
import * as utils from 'utils/utils';

import { FontScaleObservable } from '../../utils/FontScaleObservable';

function tnsLabelToUILabel(view: any): UILabel {
  return <UILabel>view._nativeView;
}

import { setNativeValueFn, writeTrace } from '../../utils/helpers';

// Define the android specific properties with a noop function
for (const propertyName of common.androidProperties) {
  setNativeValueFn(common.Label, propertyName);
}

setNativeValueFn(common.Label, 'accessibilityAdjustsFontSize', function onAccessiblityAdjustFontSize(data: ViewPropertyChangeData) {
  const tnsLabel = <common.Label>data.object;
  const uiLabel = tnsLabelToUILabel(tnsLabel);
  const value = !!data.newValue;

  const fontScaleProp = '_a11yFontScaleObservable';

  if (tnsLabel[fontScaleProp]) {
    if (value) {
      writeTrace(`Label<ios>.accessibilityAdjustsFontSize - already have a FontScaleObservable, don't enable it twice`);
      return;
    }

    writeTrace(`Label<ios>.accessibilityAdjustsFontSize - disable and remove FontScaleObservable`);

    tnsLabel[fontScaleProp].off(Observable.propertyChangeEvent);
    delete tnsLabel[fontScaleProp];
    return;
  }

  const updateFontSize = () => {
    if (!tnsLabel[fontScaleProp]) {
      return;
    }

    const oldFont = <Font>tnsLabel.style.get('_fontInternal');
    const fontScale = tnsLabel[fontScaleProp].get(FontScaleObservable.FONT_SCALE);
    if (!fontScale) {
      writeTrace(`Label<ios>.accessibilityAdjustsFontSize - updateFontSize - timer -> no fontScale`);
      return;
    }

    const newFontSize = oldFont.fontSize * fontScale;
    writeTrace(`Label<ios>.accessibilityAdjustsFontSize - updateFontSize - timer -> update fontScale: ${JSON.stringify({
      fontScale,
      newFontSize,
      oldFontSize: oldFont.fontSize,
    })}`);

    const oldUIFont = (<any>oldFont)._uiFont || UIFont.systemFontOfSize(utils.ios.getter(UIFont, UIFont.labelFontSize));

    const newFont = new Font(oldFont.fontFamily, newFontSize, oldFont.fontStyle, oldFont.fontWeight);

    uiLabel.font = newFont.getUIFont(oldUIFont);
    tnsLabel.requestLayout();
    if (tnsLabel.parent) {
      tnsLabel.parent.requestLayout();
    }
  };

  const styleCb = (args: PropertyChangeData) => {
    writeTrace(`Label<ios>.accessibilityAdjustsFontSize - styleCb -> ${args.propertyName} -> ${args.value}`);

    if (!tnsLabel.accessibilityAdjustsFontSize) {
      writeTrace(`Label<ios>.accessibilityAdjustsFontSize - styleCb -> tnsLabel.accessibilityAdjustsFontSize have been disabled unsub`);

      tnsLabel.style.off(Observable.propertyChangeEvent, styleCb);
      return;
    }

    writeTrace(`Label<ios>.accessibilityAdjustsFontSize - styleCb -> call: updateFontSize()`);
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
    if (tnsLabel[fontScaleProp]) {
      tnsLabel[fontScaleProp].off(Observable.propertyChangeEvent);
    }
    delete tnsLabel[fontScaleProp];
  });

  writeTrace(`Label<ios>.accessibilityAdjustsFontSize - set initial scale -> call: updateFontSize()`);
  updateFontSize();
});
