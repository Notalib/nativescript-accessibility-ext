# Using @nota/nativescript-accessibility-ext with angular

## Setup

Modify your `app.module.ts` by importing `NotaAccessibilityExtModule` into your `NgModule`

```typescript
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NotaAccessibilityExtModule } '@nota/nativescript-accessibility-ext/angular'; // <-- Add this line

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ItemsComponent } from "./item/items.component";
import { ItemDetailComponent } from "./item/item-detail.component";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        NotaAccessibilityExtModule, /// <-- Add this line
    ],
    declarations: [
        AppComponent,
        ItemsComponent,
        ItemDetailComponent
    ],
    providers: [],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule { }
```

## Directives

### GridLayout[a11yRows], GridLayout[a11yColumns]

It can be a good idea to scale your `rows` and `columns` to according to the accessibility font-scale setting. This can be done via the `GridLayout[a11yRows], GridLayout[a11yColumns]` directive.

```html
<GridLayout a11yRows="30, auto" a11yColumns="50, *">
  <!-- Stuff -->
</GridLayout>
```

At fontScale 1.3/130% this `GridLayout` will have `rows="39, auto"` and `columns="65, *"`, at 4.0/400% it will have `rows="120, auto"` and `columns="325, *"`

## Pipes

### a11yFontScale

Scale number values according to the accessibility font-scale setting in template
```html
<Label [height]="50 | a11yFontScale | async" text="some clever text"></Label>
```

## A11Y observables

### A11YFontScalingObservable

Inject an Observable with the current accessibility font-scale setting.

```typescript
@Component({...})
export class MyComponent {
  constructor(private fontScaling$: A11yFontScalingObservable) {}
}
```

### A11YIsServiceEnabledObservable

Is VoiceOver/TalkBack enabled?

```typescript
@Component({...})
export class MyComponent {
  constructor(private isA11yServiceEnabled$: A11yServiceEnabledObservable) {}
}
```

## Component CSS

### Font Scaling

```scss
$my-custom-font-size: 16;
$my-custom-height: 40;
$my-custom-margin: 2;
.my-class {
  height: $my-custom-height;
  margin: $my-custom-margin;
  font-size: $my-custom-font-size;

  font-size: $my-custom-font-size;

  &[ios] {
    // only available used on ios.
    font-size: calc(#{$my-custom-font-size} * var(--a11y-fontscale-factor));
  }

  &[android] {
    margin: calc(#{$my-custom-margin} * var(--a11y-fontscale-factor));
  }
}
```
