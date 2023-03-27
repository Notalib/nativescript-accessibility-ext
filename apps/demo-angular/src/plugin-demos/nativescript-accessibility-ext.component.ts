import { Component, NgZone } from '@angular/core';
import { DemoSharedNativescriptAccessibilityExt } from '@demo/shared';
import {} from '@nota/nativescript-accessibility-ext';

@Component({
  selector: 'demo-nativescript-accessibility-ext',
  templateUrl: 'nativescript-accessibility-ext.component.html',
  styles: [
    `
      .screen-reader {
        border-width: 1;
        border-radius: 10;
        padding: 10;
        margin: 0 10;
      }

      .screen-reader .h1 {
        a11y-role: header;
      }

      ListView .list-view-item {
        orientation: horizontal;
        a11y-enabled: true;
        a11y-role: button;
      }

      ListView .list-view-item.odd {
        a11y-role: switch;
        a11y-state: checked;
      }
    `,
  ],
})
export class NativescriptAccessibilityExtComponent {
  demoShared: DemoSharedNativescriptAccessibilityExt;

  constructor(private _ngZone: NgZone) {
    this.demoShared = new DemoSharedNativescriptAccessibilityExt();
  }
}
