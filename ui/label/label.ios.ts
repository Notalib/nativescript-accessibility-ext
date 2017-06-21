import * as common from './label-common';
import { Label } from './label-common';
import { Observable, PropertyChangeData } from 'data/observable';
import { Font } from 'ui/styling/font';
import * as utils from 'utils/utils';

import { FontScaleObservable } from '../../utils/FontScaleObservable';

import { writeTrace } from '../../utils/helpers';

Label.prototype[common.accessibilityAdjustFontSizeProperty.getDefault] = function getDefaultAccessibilityAdjustsFontSize(this: Label) {
  return false;
};

const fontScalePropSymbol = Symbol('ios:fontScalePropSymbol');
Label.prototype[common.accessibilityAdjustFontSizeProperty.setNative] = function setAccessibilityAdjustsFontSize(this: Label, value: boolean) {
  const tnsLabel = this;
  const uiLabel = this.nativeView;

  if (tnsLabel[fontScalePropSymbol]) {
    if (value) {
      writeTrace(`Label<ios>.accessibilityAdjustFontSize - already have a FontScaleObservable, don't enable it twice`);
      return;
    }

    writeTrace(`Label<ios>.accessibilityAdjustFontSize - disable and remove FontScaleObservable`);

    tnsLabel[fontScalePropSymbol].off(Observable.propertyChangeEvent);
    delete tnsLabel[fontScalePropSymbol];
    return;
  }

  let timer: any;
  const updateFontSize = () => {
    clearTimeout(timer);

    writeTrace(`Label<ios>.accessibilityAdjustFontSize - updateFontSize - set timer`);

    timer = setTimeout(() => {
      if (!tnsLabel[fontScalePropSymbol]) {
        return;
      }

      const oldFont = <Font>tnsLabel.style.get('_fontInternal');
      const fontScale = tnsLabel[fontScalePropSymbol].get(FontScaleObservable.FONT_SCALE);
      if (!fontScale) {
        writeTrace(`Label<ios>.accessibilityAdjustFontSize - updateFontSize - timer -> no fontScale`);
        return;
      }

      const newFontSize = oldFont.fontSize * fontScale;
      writeTrace(`Label<ios>.accessibilityAdjustFontSize - updateFontSize - timer -> update fontScale: ${JSON.stringify({
        fontScale,
        newFontSize,
        oldFontSize: oldFont.fontSize,
      })}`);

      const oldUIFont = (<any>oldFont)._uiFont || UIFont.systemFontOfSize(utils.ios.getter(UIFont, UIFont.labelFontSize));

      const newFont = new Font(oldFont.fontFamily, newFontSize, oldFont.fontStyle, oldFont.fontWeight);

      uiLabel.font = newFont.getUIFont(oldUIFont);
      tnsLabel.requestLayout();
    }, 5);
  };

  const styleCb = (args: PropertyChangeData) => {
    if (!tnsLabel['accessibilityAdjustFontSize']) {
      tnsLabel.style.off(Observable.propertyChangeEvent, styleCb);

      writeTrace(`Label<ios>.accessibilityAdjustFontSize - styleCb -> tnsLabel.accessibilityAdjustFontSize have been disabled unsub`);
      return;
    }

    writeTrace(`Label<ios>.accessibilityAdjustFontSize - styleCb -> call: updateFontSize()`);
    updateFontSize();
  };

  tnsLabel.style.on(Observable.propertyChangeEvent, styleCb);

  tnsLabel[fontScalePropSymbol] = new FontScaleObservable();

  tnsLabel[fontScalePropSymbol].on(Observable.propertyChangeEvent, (args: PropertyChangeData) => {
    if (args.propertyName === FontScaleObservable.FONT_SCALE) {
      updateFontSize();
    }
  });

  tnsLabel.on('unloaded', () => {
    if (tnsLabel[fontScalePropSymbol]) {
      tnsLabel[fontScalePropSymbol].off(Observable.propertyChangeEvent);
      delete tnsLabel[fontScalePropSymbol];
    }
  });

  writeTrace(`Label<ios>.accessibilityAdjustFontSize - set initial scale -> call: updateFontSize()`);
  updateFontSize();
};
