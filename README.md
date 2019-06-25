# @nota/nativescript-accessibility-ext
Nativescript plugin for enabling accessibility features

## Reasoning behind this plugin:
NativeScript is a framework for developing cross-platform mobile applications.

NativeScript's support for platform specific accessibility features is very limited, as it only implements
those that can be abstracted for both platforms. So you have to enable these features in JavaScript-code
rather than in the template.

The goal of this plugin is to expose all platform-specific accessibility features for both Android and iOS through component properties.

It's heavily inspired by React-Native's accessibility API:
https://facebook.github.io/react-native/docs/accessibility.html

But is written from scratch, extending NativeScript's classes.

## API:
Extends `tns-core-modules/ui/core/view` with these attributes and functions.

### Attributes and functions for both `iOS` and `Android`

#### Attribute: View.accessible (iOS, Android)
If `true` the element is an accessibility element and all the children will be treated as a single selectable component.

#### Function: View.accessibilityAnnouncement(msg?: string) (iOS, Android)
Make an announcement to the screen reader.

| msg | Description |
| --- | ----------- |
| announcement text | The text that will be read by the screen reader |
| null | The elements automationText of the element will be read by the screen reader instead |

#### Attribute: View.accessibilityLabel (iOS, Android)
Set the accessibility label on the element, this will be read by the screen reader in-place in any 'text' value the element has.
Important note:
  NativeScript provides the property automationText, this sets both `accessibilityLabel` AND `accessibilityIdentifier` on iOS which can break automated tests.
  If you use `accessibilityLabel` from this plugin, DO NOT use `automationText` at the same time.

### CSSClasses: View.ios/android
A platform css-class is added to each view.
- ios
- android

**Note:**
If you need more platform css-classes, like `.notch`, `.softnav`, `.phone`, `.tablet` etc. we suggest using `nativescript-platform-css`.
Import `nativescript-platform-css` before importing this plugin, to avoid conflicts.

### CSSClasses: View.a11y-fontscale (iOS, Android)
If you need to apply different styling when fonts are scaled, these css-classes are available on the View.
See [FontScale.md](https://raw.githubusercontent.com/Notalib/nativescript-accessibility-ext/master/src/FontScaling.md) for more.

The number indicated pct font scale:
- a11y-fontscale-50 (iOS only)
- a11y-fontscale-70 (iOS only)
- a11y-fontscale-85
- a11y-fontscale-100
- a11y-fontscale-115
- a11y-fontscale-130
- a11y-fontscale-150 (iOS only)
- a11y-fontscale-200 (iOS only - extra large fonts)
- a11y-fontscale-250 (iOS only - extra large fonts)
- a11y-fontscale-300 (iOS only - extra large fonts)
- a11y-fontscale-350 (iOS only - extra large fonts)
- a11y-fontscale-400 (iOS only - extra large fonts)

If you want auto scaling on iOS Labels see: `Label.accessibilityAdjustsFontSize`.

### Attributes and functions for `iOS`-only

Reading https://nshipster.com/uiaccessibility/ is recommended.

#### Attribute: View.accessibilityTraits (iOS)
Set one or more traits that best fits the element. Comma or space separated list of traits.

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
| disabled | Used when the control is not enabled and does not respond to user input. (You should also set `isEnabled="false"` on the element) |
| frequentUpdates | Used when the element frequently updates its label or value, but too often to send notifications. Allows an accessibility client to poll for changes. A stopwatch would be an example. |
| startsMedia | Used when activating an element starts a media session (e.g. playing a movie, recording audio) that should not be interrupted by output from an assistive technology, like VoiceOver. |
| adjustable | Used when an element can be "adjusted" (e.g. a slider). |
| allowsDirectInteraction | Used when an element allows direct touch interaction for VoiceOver users (for example, a view representing a piano keyboard). |
| pageTurn | Informs VoiceOver that it should scroll to the next page when it finishes reading the contents of the element. |

#### Attribute: View.accessibilityValue (iOS)
Define the value of an accessibility element.

This is to give the user more information about the value of a field.
For instance a `Slider` would normally have a value between 0-100%, but if the Slider represents time, you can give the user better information about the value.

#### Attribute: View.accessibilityHint (iOS)
Describes the result of performing an action on the view.

Should only be provided if the result isn't obvious from the label.

#### Attribute: View.accessibilityIdentifier (iOS)
Set the elements unique accessibilityIdentifier.
Important note:
  NativeScript provides the property automationText, this sets both `accessibilityLabel` AND `accessibilityIdentifier` on iOS which can break automated tests.
  If you use `accessibilityIdentifier` from this plugin, don't use `automationText` at the same time.

#### Attribute: View.accessibilityElementsHidden (iOS)
Indicating whether the accessibility elements contained within this accessibility element are hidden.

Defaults to `false`.

## Attribute: Label.accessibilityAdjustsFontSize (iOS)
Scales the font on a Label on iOS according to the settings in Settings -> General -> Accessibility -> Larger text
On Android this is handled automatically, on iOS you have to specify it yourself.
Note: It's similar to UILabel.adjustsFontForContentSizeCategory but affects all fonts not just the preferredFonts.
Note: Font Scale between 50% and 400%. 200% -> 400% are extra large accessibility font scaling

#### Function: View.postAccessibilityNotification(notificationType: string, arg?: string | null) (iOS)
Post an accessibility notification to iOS.
```typescript
  el.postAccessibilityNotification(notificationType, arg);
```

| notificationType | Description |
| --- | ----------- |
| screen | Notify iOS that the screen have changed |
| layout | Notify iOS that the layout have changed |
| announcement | Make an announcement to the screen reader (Please use: view.accessibilityAnnouncement(msg) for both platforms) |

| arg | Description |
| --- | ----------- |
| text | notificationType = 'announcement': Announcement text to be read |
| null | notificationType = 'layout': do nothing. notificationType = 'screen': auto selects, the first accessible element within this element will be given accessibility focus |

### Attributes and functions for `Android`-only

#### Attribute: View.accessibilityComponentType (Android)
Defines the type of accessibility element, for example if something is a button.
This isn't needed for Nativescript Buttons, but used to make other elements behave like buttons.

| value | Description |
| --- | ----------- |
| button | Button element |
| radiobutton\_checked | Checked radiobutton |
| radiobutton\_unchecked | Unchecked radiobutton |

#### Attribute: View.accessibilityLiveRegion (Android)
When components dynamically change, we want TalkBack to alert the end user.

| value | Description |
| --- | ----------- |
| none | Accessibility services should not announce changes to this view. |
| polite | Accessibility services should announce changes to this view. |
| assertive | Accessibility services should interrupt ongoing speech to immediately announce changes to this view. |

#### Attribute: View.importantForAccessibility (Android)
| key | Description |
| --- | ----------- |
| auto | (default)  |
| yes | Is important  |
| no  | Is not important  |
| no-hide-descendants | Force accessibility services to ignore the component and all of its children. For android < 19 treated as auto |

#### Function: View.sendAccessibilityEvent(eventName: string, msg?: text) (Android)
Trigger an accessibility event on Android
```typescript
  el.sendAccessibilityEvent(eventName, msg);
```

| eventName | Description |
| --- | ----------- |
| invalid\_position | Invalid selection/focus position |
| max\_text\_length | Maximum length of the text fields |
| view\_clicked | Represents the event of clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc |
| view\_long\_clicked | Represents the event of long clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc |
| view\_selected | Represents the event of selecting an item usually in the context of an android.widget.AdapterView |
| view\_focused | Represents the event of setting input focus of a android.view.View |
| view\_text\_changed | Represents the event of changing the text of an android.widget.EditText |
| window\_state\_changed | Represents the event of opening a android.widget.PopupWindow, android.view.Menu, android.app.Dialog, etc |
| notification\_state\_changed | Represents the event showing a android.app.Notification |
| view\_hover\_enter | Represents the event of a hover enter over a android.view.View |
| view\_hover\_exit | Represents the event of a hover exit over a android.view.View |
| touch\_exploration\_gesture\_start | Represents the event of starting a touch exploration gesture |
| touch\_exploration\_gesture\_end | Represents the event of ending a touch exploration gesture |
| window\_content\_changed | Represents the event of changing the content of a window and more specifically the sub-tree rooted at the event's source |
| view\_scrolled | Represents the event of scrolling a view |
| view\_text\_selection\_changed | Represents the event of changing the selection in an android.widget.EditText |
| announcement | Represents the event of an application making an announcement |
| view\_accessibility\_focused | Represents the event of gaining accessibility focus |
| view\_accessibility\_focus\_cleared | Represents the event of clearing accessibility focus |
| view\_text\_traversed\_at\_movement\_granularity | Represents the event of traversing the text of a view at a given movement granularity |
| gesture\_detection\_start | Represents the event of beginning gesture detection. |
| gesture\_detection\_end | Represents the event of ending gesture detection |
| touch\_interaction\_start | Represents the event of the user starting to touch the screen |
| touch\_interaction\_end | Represents the event of the user ending to touch the screen |
| all | Mask for AccessibilityEvent all types |

`msg` is an optional argument only used for `announcement`.
If not provided with `announcement` the elements `automationText` value will be announced instead.

#### The following are not implemented (yet)
* onAccessibilityTap (iOS)
* onMagicTap (iOS)

### Global events
Each built-in nativescript View-class is extended with global-events.

**Note:**
Please note this conflicts with `nativescript-globalevents`-plugin.
If you for some reason need to load both modules, you need to import `nativescript-globalevents` before `@nota/nativescript-accessibility-ext`.

#### Adding a global-event

This event is added to every view-type.
```typescript
View.on(View.loadedEvent, (evt) => {
  const view = evt.object;
  // Do stuff.
})
```

This event is aded to all `Labels`
```typescript
Label.on(View.loadedEvent, (evt) => {
  const label = evt.object;
  // Do stuff.
})
```

#### Removing a global-event

Remove all global loaded events from the View-class.
```typescript
View.off(View.loadedEvent);
```

Remove a single global loaded event from the View-class.
```typescript
View.off(View.loadedEvent, callbackReference);
```

### Helpers:

#### FontScaleObservable

NativeScript Observable for getting the native fontScale on either platform.

**Note:**
Android: Font scale between 0.85 and 1.3 (85% -> 130%)
iOS: Font scale between 50% and 400%. 200% -> 400% are extra large accessibility font

## Using the plugin
To use the plugin in your nativescript-app, install and import the module:

```bash
npm i --save @nota/nativescript-accessibility-ext
```

### For NativeScript Core
Change to your `app.ts`/`app.js`

```typescript
import * as app from "tns-core-modules/application";
import '@nota/nativescript-accessibility-ext'; /// <-- Add this line

app.run({ moduleName: "app-root" });
```

### For nativescript-angular
Change to your `app.module.ts`

```typescript
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import '@nota/nativescript-accessibility-ext'; /// <-- Add this line
```

### For NativeScript Vue
Change to your `app.js`:

```javascript
import Vue from "nativescript-vue";
import '@nota/nativescript-accessibility-ext'; /// <-- Add this line

....
```


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
