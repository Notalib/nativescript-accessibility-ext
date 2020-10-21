import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { Trace } from '@nativescript/core';
import { NativeScriptModule } from '@nativescript/angular';
import { NotaAccessibilityExtModule } from '@nota/nativescript-accessibility-ext/angular';
import { categories } from '@nota/nativescript-accessibility-ext/trace';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home.component';

Trace.setCategories(categories.FontScale);
Trace.enable();

@NgModule({
  schemas: [NO_ERRORS_SCHEMA],
  declarations: [AppComponent, HomeComponent],
  bootstrap: [AppComponent],
  imports: [NativeScriptModule, AppRoutingModule, NotaAccessibilityExtModule],
})
export class AppModule {}
