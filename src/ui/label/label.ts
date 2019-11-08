import { Label } from '@nativescript/core/ui/label';

Object.defineProperty(Label.prototype, 'accessibilityAdjustsFontSize', {
  get() {
    return null;
  },
  set(value) {
    console.warn(`DEPRECATED: ${this}.accessibilityAdjustsFontSize = "${value}" is no longer supported, it is too buggy to maintain. Please use CSS instead`);
  },
});
