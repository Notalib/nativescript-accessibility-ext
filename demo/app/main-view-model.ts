import { Observable } from 'tns-core-modules/data/observable';
import { AccessibilityExt } from 'nativescript-accessibility-ext';

export class HelloWorldModel extends Observable {
  public message: string;
  private accessibilityExt: AccessibilityExt;

  constructor() {
    super();

    this.accessibilityExt = new AccessibilityExt();
    this.message = this.accessibilityExt.message;
  }
}
