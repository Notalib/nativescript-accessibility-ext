# nativescript-view-accessibility
Nativescript plugin for enabling accessiblity features

## Reasoning behind this plugin:
NativeScript is a framework for developing cross-platform mobile applications.

Nativescript's support for platform specific accessibility features is very limited, as it only implements
those that can be abstracted for both platforms. So you have to enable these features in JavaScript-code
rather than in the template.

The goal of this plugin is to expose all platform-specific accessibility features for both Android and iOS through component properties.

It's heavily inspired by React-Native's accessibility API:
https://facebook.github.io/react-native/docs/accessibility.html

But is written from scratch, extending NativeScript's classes.

## API:
### accessible (iOS, Android)
If `true` the element is an accessibility element and all the children will be treated as a single selectable component.

### accessibilityTraits (iOS)
Comma or space separated list of traits. You can use one or more values to make the trait as specific as possible.

| key | Description |
| --- | ----------- |
| none | Used when the element has no traits. |
| button | Used when the element should be treated as a button. |
| link | Used when the element should be treated as a link. |
| header | Used when an element acts as a header for a content section (e.g. the title of a navigation bar). |
| search | Used when the text field element should also be treated as a search field. |
| image | Used when the element should be treated as an image. Can be combined with button or link, for example. |
| selected | Used when the element is selected. For example, a selected row in a table or a selected button within a segmented control. |
| plays | Used when the element plays its own sound when activated. |
| key | Used when the element acts as a keyboard key. |
| text | Used when the element should be treated as static text that cannot change. |
| summary | Used when an element can be used to provide a quick summary of current conditions in the app when the app first launches. For example, when Weather first launches, the element with today\'s weather conditions is marked with this trait. |
| disabled | Used when the control is not enabled and does not respond to user input. |
| frequentUpdates | Used when the element frequently updates its label or value, but too often to send notifications. Allows an accessibility client to poll for changes. A stopwatch would be an example. |
| startsMedia | Used when activating an element starts a media session (e.g. playing a movie, recording audio) that should not be interrupted by output from an assistive technology, like VoiceOver. |
| adjustable | Used when an element can be "adjusted" (e.g. a slider). |
| allowsDirectInteraction | Used when an element allows direct touch interaction for VoiceOver users (for example, a view representing a piano keyboard). |
| pageTurn | Informs VoiceOver that it should scroll to the next page when it finishes reading the contents of the element. |

### accessibilityValue (iOS)
Define the value of an accessibility element.

This is to give the user more information about the value of a field.
For instance a `Slider` would normally have a value between 0-100%, but if the Slider represents time, you can give the user better information about the value.

### accessibilityComponentType (Android)
Defines the type of accessibility element, for example if something is a button.
This isn't needed for Nativescript Buttons, but used to make other elements behave like buttons.

| key | Description |
| --- | ----------- |
| button | Button element |
| radiobutton\_checked | Checked radiobutton |
| radiobutton\_unchecked | Unchecked radiobutton |

### accessibilityLiveRegion (Android)
When components dynamically change, we want TalkBack to alert the end user.

| key | Description |
| --- | ----------- |
| none | Accessibility services should not announce changes to this view. |
| polite | Accessibility services should announce changes to this view. |
| assertive | Accessibility services should interrupt ongoing speech to immediately announce changes to this view. |

### importantForAccessibility (Android)
| key | Description |
| --- | ----------- |
| auto | (default)  |
| yes | Is important  |
| no  | Is not important  |
| no-hide-descendants | Force accessibility services to ignore the component and all of its children. For android < 19 treated as auto |

### The following are not implemented (yet)
* accessibilityLabel (NativeScript implements this as automationText. android maps to ContentDescription and iOS to both accessibilityLabel and acccesibilityIdentifier)
* onAccessibilityTap (iOS)
* onMagicTap (iOS)
* sendAccessibilityEvent (Android)

## Using the plugin
To use the plugin in your nativescript-app, install and import the module:

```bash
npm i --save @nota/nativescript-accessibility-ext
```

Import in your `app.ts`/`app.js`, just after you import nativescript modules (`NativeScriptModule` if you run `nativescript-angular`)

```typescript
import '@nota/nativescript-accessibility-ext';
```

Start adding the new properties to your templates:
```xml
<StackLayout
  accessible="true"
  automationText="This now a button"
  accessibilityComponentType="button"
  accessibilityTraits="button"
>
  <Label text="First button" (tap)="tapped($event)"></Label>
</StackLayout>
```

## About Nota
Nota is the Danish Library and Expertise Center for people with print disabilities.

To become a member of Nota you must be able to document that you cannot read ordinary printed text. Members of Nota are visually impaired, dyslexic or otherwise impaired.

Our purpose is to ensure equal access to knowledge, community participation and experiences for people who're unable to read ordinary printed text.
