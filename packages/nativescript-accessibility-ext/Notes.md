# Implementing iOS accessibility features

On iOS certain accessibility features requires us to define functions to the Native-objects.

## Functions:

### accessibilityActivate()
  Tells the element to activate itself and report the success or failure of the operation.

### accessibilityIncrement()
  Tells the accessibility element to increment the value of its content.

  User action: A one-finger swipe up that increments a value in an element.

### accessibilityDecrement()
  Tells the accessibility element to decrement the value of its content.

  User action: A one-finger swipe down that decrements a value in an element.

### accessibilityScroll(UIAccessibilityScrollDirection)
  Scrolls screen content in an application-specific way and returns the success or failure of the action.

  User action: A three-finger swipe that scrolls content vertically or horizontally.

### accessibilityPerformEscape()
  Dismisses a modal view and returns the success or failure of the action.

  User action: A two-finger Z-shaped gesture that dismisses a modal dialog, or goes back one level in a navigation hierarchy.
               Returns true, if we're handling the escape.
  Dev note: Unlike **accessibilityPerformMagicTap()** this cannot be added to the AppDelegate in NativeScript.

### accessibilityPerformMagicTap()
  Performs a salient action.

  User action: A two-finger double-tap that performs the most-intended action.
               This could be play/pause in an audio-player or pick/hang up in a phone-app.
  Dev note: Can be added to the AppDelegate in NativeScript.

## Links
  https://developer.apple.com/documentation/uikit/accessibility/uiaccessibilityaction
  https://developer.apple.com/library/content/featuredarticles/ViewControllerPGforiPhoneOS/SupportingAccessibility.html
