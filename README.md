# nativescript-view-accessibility
Nativescript plugin for enabling accessiblity features

## Reasoning behind this plugin:

NativeScript's component class doesn't expose platform specific accessibility features,
so one have to set them in code.
The idea behind this plugin is to enabling this in template code.

The plugin is inspired by the way React-Native does it: https://facebook.github.io/react-native/docs/accessibility.html
But written from scratch for NativeScript

### Note:
* accessible (iOS, Android)
  * true/false
* accessibilityTraits (iOS)
  * Comma or space separated list of traits, use one or more values
* accessibilityComponentType (Android)
  * button, radiobutton\_checked’ and radiobutton\_unchecked
* accessibilityLiveRegion (Android)
  * none, polite, assertive
* importantForAccessibility (Android)
  * yes, no, no-hide-descendants, auto (default)

The following are not implemented (yet)
* accessibilityLabel (NativeScript implements this as automationText. android maps to ContentDescription and iOS to both accessibilityLabel and acccesibilityIdentifier)
* onAccessibilityTap (iOS)
* onMagicTap (iOS)
* sendAccessibilityEvent (Android)

## Using the plugin

```bash
npm i --save @nota/nativescript-accessibility-ext
```

Add this to your code:

```typescript
import '@nota/nativescript-accessibility-ext';
```
