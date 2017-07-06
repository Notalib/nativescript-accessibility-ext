// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import '@nota/nativescript-accessibility-ext';
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { AppComponent } from "./app.component";
import * as trace from 'trace';

trace.setCategories('A11Y');
trace.enable();

@NgModule({
  bootstrap: [
    AppComponent
  ],
  imports: [
    NativeScriptModule,
    NativeScriptFormsModule,
  ],
  declarations: [
    AppComponent
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class AppModule {}
