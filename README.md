# nativescript-view-accessibility
Nativescript plugin for enabling accessiblity features

## Reasoning behind this plugin:

NativeScript's component class doesn't expose platform specific accessibility features,
so one have to set them in code.
The idea behind this plugin is to enabling this in template code.

The plugin is inspired by the way React-Native does it: https://facebook.github.io/react-native/docs/accessibility.html
But written from scratch for NativeScript

## Using the plugin

```bash
npm i --save nativescript-accessibiity-ext
```

Add this to your code:

```typescript
import 'nativescript-accessibiity-ext';
```
