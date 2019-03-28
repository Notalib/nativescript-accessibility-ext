import { View as TNSView } from 'tns-core-modules/ui/core/view';
import { GestureTypes } from 'tns-core-modules/ui/gestures';
import { notifyAccessibilityFocusState, writeTrace } from './helpers';
import { isAccessibilityServiceEnabled } from './utils';

const AccessibilityEvent = android.view.accessibility.AccessibilityEvent;
type AccessibilityEvent = android.view.accessibility.AccessibilityEvent;
const AccessibilityManager = android.view.accessibility.AccessibilityManager;
type AccessibilityManager = android.view.accessibility.AccessibilityManager;
const AccessibilityDelegateCompat = android.support.v4.view.AccessibilityDelegateCompat;
type AccessibilityDelegateCompat = android.support.v4.view.AccessibilityDelegateCompat;
const AccessibilityNodeInfoCompat = android.support.v4.view.accessibility.AccessibilityNodeInfoCompat;
type AccessibilityNodeInfoCompat = android.support.v4.view.accessibility.AccessibilityNodeInfoCompat;
const AndroidView = android.view.View;
type AndroidView = android.view.View;
const ViewCompat = android.support.v4.view.ViewCompat;
type ViewCompat = android.support.v4.view.ViewCompat;

function getAccessibilityManager(view: AndroidView): AccessibilityManager {
  return view.getContext().getSystemService(android.content.Context.ACCESSIBILITY_SERVICE);
}

const TYPE_VIEW_ACCESSIBILITY_FOCUSED = AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED;
const TYPE_VIEW_ACCESSIBILITY_FOCUS_CLEARED = AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUS_CLEARED;
let lastFocusedView: WeakRef<TNSView>;
function accessibilityEventHelper(view: TNSView, eventType: number) {
  if (!isAccessibilityServiceEnabled()) {
    return;
  }

  if (!view) {
    return;
  }

  const isReceivedFocusEvent = eventType === TYPE_VIEW_ACCESSIBILITY_FOCUSED;
  const isLostFocusEvent = eventType === TYPE_VIEW_ACCESSIBILITY_FOCUS_CLEARED;

  if (isReceivedFocusEvent || isLostFocusEvent) {
    if (isReceivedFocusEvent) {
      const lastView = lastFocusedView && lastFocusedView.get();
      if (lastView && view !== lastView) {
        notifyAccessibilityFocusState(lastView, false, true);
      }

      lastFocusedView = new WeakRef(view);
    }

    notifyAccessibilityFocusState(view, isReceivedFocusEvent, isLostFocusEvent);
    return;
  }

  /**
   * Android API >= 26 handles accessibility tap-events by converting them to TYPE_VIEW_CLICKED
   * These aren't triggered for custom tap events in NativeScript.
   */
  if (android.os.Build.VERSION.SDK_INT >= 26) {
    if (eventType === AccessibilityEvent.TYPE_VIEW_CLICKED) {
      // Find all tap gestures and trigger them.
      for (const tapGesture of view.getGestureObservers(GestureTypes.tap) || []) {
        tapGesture.callback({
          android: null,
          eventName: 'tap',
          ios: null,
          object: view,
          type: GestureTypes.tap,
          view,
        });
      }

      return;
    }
  }
}

let TNSAccessibilityDelegateCompat: new (owner: TNSView) => AccessibilityDelegateCompat;

function ensureDelegates() {
  if (TNSAccessibilityDelegateCompat) {
    return;
  }

  const ButtonClassName = android.widget.Button.class.getName();
  const RadioButtonClassName = android.widget.RadioButton.class.getName();

  class TNSAccessibilityDelegateCompatImpl extends AccessibilityDelegateCompat {
    private readonly owner: WeakRef<TNSView>;

    constructor(owner: TNSView) {
      super();

      this.owner = new WeakRef(owner);

      return global.__native(this);
    }

    public onInitializeAccessibilityNodeInfo(host: AndroidView, info: AccessibilityNodeInfoCompat) {
      super.onInitializeAccessibilityNodeInfo(host, info);

      const owner = this.owner.get();
      if (!owner || !owner.accessibilityComponentType) {
        return;
      }

      switch (owner.accessibilityComponentType) {
        case AccessibilityHelper.BUTTON: {
          info.setClassName(ButtonClassName);
          break;
        }
        case AccessibilityHelper.RADIOBUTTON_CHECKED:
        case AccessibilityHelper.RADIOBUTTON_UNCHECKED: {
          info.setClassName(RadioButtonClassName);
          info.setCheckable(true);
          info.setChecked(owner.accessibilityComponentType === AccessibilityHelper.RADIOBUTTON_CHECKED);
        }
      }
    }

    public sendAccessibilityEvent(host: android.view.ViewGroup, eventType: number) {
      super.sendAccessibilityEvent(host, eventType);

      accessibilityEventHelper(this.owner.get(), eventType);
    }
  }

  TNSAccessibilityDelegateCompat = TNSAccessibilityDelegateCompatImpl;
}

let accessibilityEventMap: Map<string, number>;
function ensureAccessibilityEventMap() {
  if (accessibilityEventMap) {
    return;
  }

  accessibilityEventMap = new Map<string, number>([
    /**
     * Invalid selection/focus position.
     */
    ['invalid_position', AccessibilityEvent.INVALID_POSITION],
    /**
     * Maximum length of the text fields.
     */
    ['max_text_length', AccessibilityEvent.MAX_TEXT_LENGTH],
    /**
     * Represents the event of clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc.
     */
    ['view_clicked', AccessibilityEvent.TYPE_VIEW_CLICKED],
    /**
     * Represents the event of long clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc.
     */
    ['view_long_clicked', AccessibilityEvent.TYPE_VIEW_LONG_CLICKED],
    /**
     * Represents the event of selecting an item usually in the context of an android.widget.AdapterView.
     */
    ['view_selected', AccessibilityEvent.TYPE_VIEW_SELECTED],
    /**
     * Represents the event of setting input focus of a android.view.View.
     */
    ['view_focused', AccessibilityEvent.TYPE_VIEW_FOCUSED],
    /**
     * Represents the event of changing the text of an android.widget.EditText.
     */
    ['view_text_changed', AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED],
    /**
     * Represents the event of opening a android.widget.PopupWindow, android.view.Menu, android.app.Dialog, etc.
     */
    ['window_state_changed', AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED],
    /**
     * Represents the event showing a android.app.Notification.
     */
    ['notification_state_changed', AccessibilityEvent.TYPE_NOTIFICATION_STATE_CHANGED],
    /**
     * Represents the event of a hover enter over a android.view.View.
     */
    ['view_hover_enter', AccessibilityEvent.TYPE_VIEW_HOVER_ENTER],
    /**
     * Represents the event of a hover exit over a android.view.View.
     */
    ['view_hover_exit', AccessibilityEvent.TYPE_VIEW_HOVER_EXIT],
    /**
     * Represents the event of starting a touch exploration gesture.
     */
    ['touch_exploration_gesture_start', AccessibilityEvent.TYPE_TOUCH_EXPLORATION_GESTURE_START],
    /**
     * Represents the event of ending a touch exploration gesture.
     */
    ['touch_exploration_gesture_end', AccessibilityEvent.TYPE_TOUCH_EXPLORATION_GESTURE_END],
    /**
     * Represents the event of changing the content of a window and more specifically the sub-tree rooted at the event's source.
     */
    ['window_content_changed', AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED],
    /**
     * Represents the event of scrolling a view.
     */
    ['view_scrolled', AccessibilityEvent.TYPE_VIEW_SCROLLED],
    /**
     * Represents the event of changing the selection in an android.widget.EditText.
     */
    ['view_text_selection_changed', AccessibilityEvent.TYPE_VIEW_TEXT_SELECTION_CHANGED],
    /**
     * Represents the event of an application making an announcement.
     */
    ['announcement', AccessibilityEvent.TYPE_ANNOUNCEMENT],
    /**
     * Represents the event of gaining accessibility focus.
     */
    ['view_accessibility_focused', AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED],
    /**
     * Represents the event of clearing accessibility focus.
     */
    ['view_accessibility_focus_cleared', AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUS_CLEARED],
    /**
     * Represents the event of traversing the text of a view at a given movement granularity.
     */
    ['view_text_traversed_at_movement_granularity', AccessibilityEvent.TYPE_VIEW_TEXT_TRAVERSED_AT_MOVEMENT_GRANULARITY],
    /**
     * Represents the event of beginning gesture detection.
     */
    ['gesture_detection_start', AccessibilityEvent.TYPE_GESTURE_DETECTION_START],
    /**
     * Represents the event of ending gesture detection.
     */
    ['gesture_detection_end', AccessibilityEvent.TYPE_GESTURE_DETECTION_END],
    /**
     * Represents the event of the user starting to touch the screen.
     */
    ['touch_interaction_start', AccessibilityEvent.TYPE_TOUCH_INTERACTION_START],
    /**
     * Represents the event of the user ending to touch the screen.
     */
    ['touch_interaction_end', AccessibilityEvent.TYPE_TOUCH_INTERACTION_END],
    /**
     * Mask for AccessibilityEvent all types.
     */
    ['all', AccessibilityEvent.TYPES_ALL_MASK],
  ]);
}

const lastComponentTypeSymbol = Symbol('Android:lastComponentType');

export class AccessibilityHelper {
  public static get BUTTON() {
    return 'button';
  }

  public static get RADIOBUTTON_CHECKED() {
    return 'radiobutton_checked';
  }

  public static get RADIOBUTTON_UNCHECKED() {
    return 'radiobutton_unchecked';
  }

  public static get ACCESSIBLE() {
    return 'accessible';
  }

  public static updateAccessibilityComponentType(tnsView: TNSView, androidView: AndroidView, componentType: string) {
    writeTrace(`updateAccessibilityComponentType: tnsView:${tnsView}, androidView:${androidView} componentType:${componentType}`);

    ensureDelegates();

    if (componentType && androidView[lastComponentTypeSymbol] === componentType) {
      writeTrace(`updateAccessibilityComponentType - ${tnsView} - componentType not changed`);
      return;
    }

    ViewCompat.setAccessibilityDelegate(androidView, new TNSAccessibilityDelegateCompat(tnsView));
    androidView[lastComponentTypeSymbol] = componentType;
  }

  public static removeAccessibilityComponentType(androidView: AndroidView) {
    writeTrace(`removeAccessibilityComponentType from ${androidView}`);

    ViewCompat.setAccessibilityDelegate(androidView, null);
  }

  public static sendAccessibilityEvent(androidView: AndroidView, eventName: string, text?: string) {
    if (!eventName) {
      writeTrace(`sendAccessibilityEvent: no eventName provided`);
      return;
    }

    if (!isAccessibilityServiceEnabled()) {
      writeTrace(`sendAccessibilityEvent: ACCESSIBILITY_SERVICE is not enabled do nothing for ${eventName} -> ${text}`);
      return;
    }

    const a11yService = getAccessibilityManager(androidView);
    if (!a11yService.isEnabled()) {
      writeTrace(`sendAccessibilityEvent: ACCESSIBILITY_SERVICE is not enabled do nothing for ${eventName} -> ${text}`);
      return;
    }

    ensureAccessibilityEventMap();

    eventName = eventName.toLowerCase();
    const eventInt = accessibilityEventMap.get(eventName);
    if (eventInt === undefined) {
      writeTrace(`sendAccessibilityEvent: '${eventName}' is unknown`);
      return;
    }

    const a11yEvent = AccessibilityEvent.obtain(eventInt);
    a11yEvent.setSource(androidView);

    a11yEvent.getText().clear();

    if (!text) {
      text = androidView.getContentDescription();
      writeTrace(`sendAccessibilityEvent: '${eventName}' text not provided uses androidView.getContentDescription()`);
    }

    writeTrace(`sendAccessibilityEvent: send event: '${eventName}' with text: '${JSON.stringify(text)}'`);

    if (text) {
      a11yEvent.getText().add(text);
    }

    a11yService.sendAccessibilityEvent(a11yEvent);
  }
}
