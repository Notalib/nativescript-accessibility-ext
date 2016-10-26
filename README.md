# nativescript-view-accessibility
Nativescript plugin for enabling accessiblity features

## Reasoning behind this plugin:
NativeScript is a create framework for developing cross-platform mobil application.

Their support for platform specific accessibility features is very limited as they only implement
those that can be abstracted for both platforms. So you have to enable those features in JavaScript-code
rather than in template.

The goal of this plugin is to implement those feature for both Android and iOS.

It's heavily inspired by React-Native's accessibility API:
https://facebook.github.io/react-native/docs/accessibility.html

But is written from scratch, extending NativeScript's classes.

## Using the plugin

```bash
npm i --save @nota/nativescript-accessibility-ext
```

Import in your `app.ts`/`app.js`, just after you import nativescript modules (`NativeScriptModule` if you run `nativescript-angular`)

```typescript
import '@nota/nativescript-accessibility-ext';
```

## About Nota
Nota is the Danish National Library for People with Reading-disabilities.

Nota makes reading material available for people with reading disabilities on behalf of the Danish state as an institution under the Ministry of Culture.

Our purpose is to ensure equal access to knowledge, community participation and experiences for people who're unable to read ordinary printed text.
