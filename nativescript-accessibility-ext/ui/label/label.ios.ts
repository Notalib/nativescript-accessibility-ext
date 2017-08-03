import * as common from './label-common';
import { Label } from './label-common';
import { Observable, PropertyChangeData } from 'data/observable';
import { Font } from 'ui/styling/font';
import * as utils from 'utils/utils';

import { FontScaleObservable } from '../../utils/FontScaleObservable';

import { writeTrace } from '../../utils/helpers';

Label.prototype[common.accessibilityAdjustsFontSizeProperty.getDefault] = function getDefaultAccessibilityAdjustsFontSize(this: Label) {
  return false;
};

const fontScalePropSymbol = Symbol('ios:fontScalePropSymbol');
Label.prototype[common.accessibilityAdjustsFontSizeProperty.setNative] = function setAccessibilityAdjustsFontSize(this: Label, value: boolean) {
  const tnsLabel = this;
  const uiLabel = this.nativeView;

  if (tnsLabel[fontScalePropSymbol]) {
    if (value) {
      writeTrace(`Label<ios>.accessibilityAdjustsFontSize - already have a FontScaleObservable, don't enable it twice`);
      return;
    }

    writeTrace(`Label<ios>.accessibilityAdjustsFontSize - disable and remove FontScaleObservable`);

    tnsLabel[fontScalePropSymbol].off(Observable.propertyChangeEvent);
    delete tnsLabel[fontScalePropSymbol];
    return;
  }

  const weakTnsLabel = new WeakRef(tnsLabel);

  let timer: any;
  const updateFontSize = (delay = 0) => {
    clearTimeout(timer);
    const localTnsLabel = weakTnsLabel.get();
    if (!localTnsLabel || !localTnsLabel[fontScalePropSymbol]) {
      return;
    }

    timer = setTimeout(() => {
      const oldFont = <Font>localTnsLabel.style.get('_fontInternal');
      const fontScale = localTnsLabel[fontScalePropSymbol].get(FontScaleObservable.FONT_SCALE);
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

      setTimeout(() => localTnsLabel.requestLayout(), 1);
    }, delay);
  };

  const styleCb = (args: PropertyChangeData) => {
    const localTnsLabel = weakTnsLabel.get();
    writeTrace(`Label<ios>.accessibilityAdjustsFontSize - styleCb -> ${args.propertyName} -> ${args.value}`);

    if (!localTnsLabel['accessibilityAdjustsFontSize']) {
      writeTrace(`Label<ios>.accessibilityAdjustsFontSize - styleCb -> tnsLabel.accessibilityAdjustsFontSize have been disabled unsub`);

      localTnsLabel.style.off(Observable.propertyChangeEvent, styleCb);
      return;
    }

    writeTrace(`Label<ios>.accessibilityAdjustsFontSize - styleCb -> call: updateFontSize()`);
    updateFontSize(2);
  };

  tnsLabel.style.on(Observable.propertyChangeEvent, styleCb);

  const fontScaleObservable = tnsLabel[fontScalePropSymbol] = new FontScaleObservable();
  fontScaleObservable.on(Observable.propertyChangeEvent, (args: PropertyChangeData) => {
    if (!weakTnsLabel.get()) {
      fontScaleObservable.off(Observable.propertyChangeEvent);
      return;
    }

    if (args.propertyName === FontScaleObservable.FONT_SCALE) {
      updateFontSize();
    }
  });

  writeTrace(`Label<ios>.accessibilityAdjustsFontSize - set initial scale -> call: updateFontSize()`);
  updateFontSize();
};
