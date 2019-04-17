import '@nota/nativescript-accessibility-ext';
import { platformNativeScriptDynamic } from 'nativescript-angular/platform';
import { AppModule } from './app.module';

platformNativeScriptDynamic().bootstrapModule(AppModule);
