import { Observable, PropertyChangeData } from 'tns-core-modules/data/observable';
import { View } from 'tns-core-modules/ui/core/view';
import { Label } from 'tns-core-modules/ui/label';
import { Font } from 'tns-core-modules/ui/styling/font';
import * as utils from 'tns-core-modules/utils/utils';
import { FontScaleObservable } from '../../utils/FontScaleObservable';
import { writeTrace } from '../../utils/helpers';
import * as common from './label-common';

function getNativeView(view: View): UILabel {
  return view.ios;
}

const fontScalePropSymbol = Symbol.for('ios:fontScalePropSymbol');
Label.prototype[common.accessibilityAdjustsFontSizeProperty.setNative] = function accessibilityAdjustsFontSizeSetNative(this: Label, value: boolean) {
  const cls = `Label<${this}.ios>.accessibilityAdjustsFontSize`;
  if (this[fontScalePropSymbol]) {
    if (value) {
      writeTrace(`${cls} - already have a FontScaleObservable, don't enable it twice`);
      return;
    }

    writeTrace(`${cls} - disable and remove FontScaleObservable`);

    this[fontScalePropSymbol].off(Observable.propertyChangeEvent);
    delete this[fontScalePropSymbol];
    return;
  }

  const weakTnsLabel = new WeakRef(this);

  let timer: any;
  const updateFontSize = (delay = 0) => {
    const clsUpdate = `${cls} - updateFontSize`;
    clearTimeout(timer);

    const localTnsLabel = weakTnsLabel.get();
    if (!localTnsLabel || !localTnsLabel[fontScalePropSymbol]) {
      return;
    }

    timer = setTimeout(() => {
      const clsTimer = `${clsUpdate} - timer`;
      const oldFont = <Font>localTnsLabel.style.get('_fontInternal');
      const fontScale = localTnsLabel[fontScalePropSymbol].get(FontScaleObservable.FONT_SCALE);
      if (!fontScale) {
        writeTrace(`${clsTimer} -> no fontScale`);
        return;
      }

      const newFontSize = oldFont.fontSize * fontScale;
      writeTrace(
        `${clsTimer} -> update fontScale: ${JSON.stringify({
          fontScale,
          newFontSize,
          oldFontSize: oldFont.fontSize,
        })}`,
      );

      const oldUIFont = (<any>oldFont)._uiFont || UIFont.systemFontOfSize(utils.ios.getter(UIFont, UIFont.labelFontSize));

      const newFont = new Font(oldFont.fontFamily, newFontSize, oldFont.fontStyle, oldFont.fontWeight);

      const uiLabel = getNativeView(this);
      uiLabel.font = newFont.getUIFont(oldUIFont);

      setTimeout(() => localTnsLabel.requestLayout(), 1);
    }, delay);
  };

  const styleCb = (args: PropertyChangeData) => {
    const clsStyle = `${cls} - styleCb`;
    const localTnsLabel = weakTnsLabel.get();
    writeTrace(`${clsStyle} -> ${args.propertyName} -> ${args.value}`);

    if (!localTnsLabel.accessibilityAdjustsFontSize) {
      writeTrace(`${clsStyle} -> tnsLabel.accessibilityAdjustsFontSize have been disabled`);

      localTnsLabel.style.off(Observable.propertyChangeEvent, styleCb);
      return;
    }

    writeTrace(`${clsStyle} -> call: updateFontSize()`);
    updateFontSize(2);
  };

  this.style.on(Observable.propertyChangeEvent, styleCb);

  const fontScaleObservable = (this[fontScalePropSymbol] = new FontScaleObservable());
  fontScaleObservable.on(Observable.propertyChangeEvent, (args: PropertyChangeData) => {
    if (!weakTnsLabel.get()) {
      fontScaleObservable.off(Observable.propertyChangeEvent);
      return;
    }

    if (args.propertyName === FontScaleObservable.FONT_SCALE) {
      updateFontSize();
    }
  });

  writeTrace(`${cls} - set initial scale -> call: updateFontSize()`);
  updateFontSize();
};
