// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import '@nota/nativescript-accessibility-ext';
import { NativeScriptFormsModule } from 'nativescript-angular/forms';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';

import * as trace from 'trace';
import { AppComponent } from './app.component';

trace.setCategories('A11Y');
trace.enable();

@NgModule({
  bootstrap: [AppComponent],
  imports: [NativeScriptModule, NativeScriptFormsModule],
  declarations: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
