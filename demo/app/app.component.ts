import { Component } from '@angular/core';

import * as dialogs from 'ui/dialogs';

@Component({
  selector: 'my-app',
  templateUrl: 'app.component.html',
  styleUrls: [
    'app.component.css',
  ]
})
export class AppComponent {
  tapped(e: any) {
    const el = e.object;
    console.log(el);

    dialogs.alert('tapped ' + el);
  }
}
