import { Component, NgZone } from '@angular/core';
import { DemoSharedNativescriptAccessibilityExt } from '@demo/shared';
import {} from '@nativescript/nativescript-accessibility-ext';

@Component({
  selector: 'demo-nativescript-accessibility-ext',
  templateUrl: 'nativescript-accessibility-ext.component.html',
})
export class NativescriptAccessibilityExtComponent {
  demoShared: DemoSharedNativescriptAccessibilityExt;

  constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    this.demoShared = new DemoSharedNativescriptAccessibilityExt();
  }
}
