# nativescript-view-accessibility
Nativescript plugin for enabling accessiblity features

## Reasoning behind this plugin:

NativeScript's component class doesn't expose platform specific accessibility features,
so one have to set them in code.
The idea behind this plugin is to enabling this in template code.

The plugin is inspired by the way React-Native does it: https://facebook.github.io/react-native/docs/accessibility.html
But written from scratch for NativeScript

### Note:
The following are not implemented (yet)
* accessibilityLabel (NativeScript implements this as automationText. android maps to ContentDescription and iOS to both accessibilityLabel and acccesibilityIdentifier)
* onAccessibilityTap (iOS)
* onMagicTap (iOS)
* sendAccessibilityEvent (Android)

## Using the plugin

```bash
npm i --save nativescript-accessibility-ext
```

Add this to your code:

```typescript
import 'nativescript-accessibility-ext';
```
