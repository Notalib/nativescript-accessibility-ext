// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { platformNativeScriptDynamic, NativeScriptModule } from "nativescript-angular/platform";
import '@nota/nativescript-accessibility-ext';
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";

@NgModule({
    declarations: [AppComponent],
    bootstrap: [AppComponent],
    imports: [NativeScriptModule],
})
class AppComponentModule {}

platformNativeScriptDynamic().bootstrapModule(AppComponentModule);
