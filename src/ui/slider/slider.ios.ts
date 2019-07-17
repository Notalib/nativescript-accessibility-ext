import { setViewFunction } from '../../utils/helpers';
import { Slider } from './slider-common';

class NotaUISlider extends UISlider {
  public owner: WeakRef<Slider>;

  public static initWithOwner(owner: WeakRef<Slider>) {
    const slider = NotaUISlider.new() as NotaUISlider;
    slider.owner = owner;
    return slider;
  }

  public accessibilityIncrement() {
    const owner = this.owner.get();
    if (!owner) {
      this.value += 10;
      return;
    }

    this.value = owner._handlerAccessibilityIncrementEvent();
    this.sendActionsForControlEvents(UIControlEvents.ValueChanged);
  }

  public accessibilityDecrement() {
    const owner = this.owner.get();
    if (!owner) {
      this.value += 10;
      return;
    }

    this.value = owner._handlerAccessibilityDecrementEvent();

    this.sendActionsForControlEvents(UIControlEvents.ValueChanged);
  }
}

setViewFunction(Slider, 'createNativeView', function sliderCreateNativeView(this: Slider) {
  return NotaUISlider.initWithOwner(new WeakRef(this));
});
