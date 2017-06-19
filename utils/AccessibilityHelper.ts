import { View } from 'ui/core/view';
import { notityAccessibilityFocusState } from './helpers';

abstract class BaseDelegate extends android.view.View.AccessibilityDelegate {
  constructor(private owner: View) {
    super();
  }

  public onRequestSendAccessibilityEvent(viewGroup: android.view.ViewGroup, child: android.view.View, event: android.view.accessibility.AccessibilityEvent): boolean {
    const receivedFocus = event.getEventType() === android.view.accessibility.AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED;
    const lostFocus = event.getEventType() === android.view.accessibility.AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUS_CLEARED;

    if (receivedFocus || lostFocus) {
      notityAccessibilityFocusState(this.owner, receivedFocus, lostFocus);
    }

    return super.onRequestSendAccessibilityEvent(viewGroup, child, event);
  }
}

class PlainDelegate extends BaseDelegate {
  constructor(owner: View) {
    super(owner);

    return global.__native(this);
  }
}

class ButtonDelegate extends BaseDelegate {
  private className = android.widget.Button.class.getName();
  constructor(owner: View) {
    super(owner);

    return global.__native(this);
  }

  public onInitializeAccessibilityEvent(host: android.view.View, event: android.view.accessibility.AccessibilityEvent) {
    super.onInitializeAccessibilityEvent(host, event);
    event.setClassName(this.className);
  }

  public onInitializeAccessibilityNodeInfo(host: android.view.View, info: android.view.accessibility.AccessibilityNodeInfo) {
    super.onInitializeAccessibilityNodeInfo(host, info);
    info.setClassName(this.className);
  }
}

class RadioButtonDelegate extends BaseDelegate {
  private className = android.widget.RadioButton.class.getName();
  constructor(owner: any, private checked: boolean) {
    super(owner);

    return global.__native(this);
  }

  public onInitializeAccessibilityEvent(host: android.view.View, event: android.view.accessibility.AccessibilityEvent) {
    super.onInitializeAccessibilityEvent(host, event);
    event.setClassName(this.className);
    event.setChecked(this.checked);
  }

  public onInitializeAccessibilityNodeInfo(host: android.view.View, info: android.view.accessibility.AccessibilityNodeInfo) {
    super.onInitializeAccessibilityNodeInfo(host, info);
    info.setClassName(this.className);
    info.setCheckable(true);
    info.setChecked(this.checked);
  }
}

let accessibilityEventMap: Map<string, number>;
function ensureAccessibilityEventMap() {
  if (accessibilityEventMap) {
    return;
  }

  const ae = android.view.accessibility.AccessibilityEvent;
  accessibilityEventMap = new Map<string, number>([
    /**
     * Invalid selection/focus position.
     */
    ['invalid_position', ae.INVALID_POSITION],
    /**
     * Maximum length of the text fields.
     */
    ['max_text_length', ae.MAX_TEXT_LENGTH],
    /**
     * Represents the event of clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc.
     */
    ['view_clicked', ae.TYPE_VIEW_CLICKED],
    /**
     * Represents the event of long clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc.
     */
    ['view_long_clicked', ae.TYPE_VIEW_LONG_CLICKED],
    /**
     * Represents the event of selecting an item usually in the context of an android.widget.AdapterView.
     */
    ['view_selected', ae.TYPE_VIEW_SELECTED],
    /**
     * Represents the event of setting input focus of a android.view.View.
     */
    ['view_focused', ae.TYPE_VIEW_FOCUSED],
    /**
     * Represents the event of changing the text of an android.widget.EditText.
     */
    ['view_text_changed', ae.TYPE_VIEW_TEXT_CHANGED],
    /**
     * Represents the event of opening a android.widget.PopupWindow, android.view.Menu, android.app.Dialog, etc.
     */
    ['window_state_changed', ae.TYPE_WINDOW_STATE_CHANGED],
    /**
     * Represents the event showing a android.app.Notification.
     */
    ['notification_state_changed', ae.TYPE_NOTIFICATION_STATE_CHANGED],
    /**
     * Represents the event of a hover enter over a android.view.View.
     */
    ['view_hover_enter', ae.TYPE_VIEW_HOVER_ENTER],
    /**
     * Represents the event of a hover exit over a android.view.View.
     */
    ['view_hover_exit', ae.TYPE_VIEW_HOVER_EXIT],
    /**
     * Represents the event of starting a touch exploration gesture.
     */
    ['touch_exploration_gesture_start', ae.TYPE_TOUCH_EXPLORATION_GESTURE_START],
    /**
     * Represents the event of ending a touch exploration gesture.
     */
    ['touch_exploration_gesture_end', ae.TYPE_TOUCH_EXPLORATION_GESTURE_END],
    /**
     * Represents the event of changing the content of a window and more specifically the sub-tree rooted at the event's source.
     */
    ['window_content_changed', ae.TYPE_WINDOW_CONTENT_CHANGED],
    /**
     * Represents the event of scrolling a view.
     */
    ['view_scrolled', ae.TYPE_VIEW_SCROLLED],
    /**
     * Represents the event of changing the selection in an android.widget.EditText.
     */
    ['view_text_selection_changed', ae.TYPE_VIEW_TEXT_SELECTION_CHANGED],
    /**
     * Represents the event of an application making an announcement.
     */
    ['announcement', ae.TYPE_ANNOUNCEMENT],
    /**
     * Represents the event of gaining accessibility focus.
     */
    ['view_accessibility_focused', ae.TYPE_VIEW_ACCESSIBILITY_FOCUSED],
    /**
     * Represents the event of clearing accessibility focus.
     */
    ['view_accessibility_focus_cleared', ae.TYPE_VIEW_ACCESSIBILITY_FOCUS_CLEARED],
    /**
     * Represents the event of traversing the text of a view at a given movement granularity.
     */
    ['view_text_traversed_at_movement_granularity', ae.TYPE_VIEW_TEXT_TRAVERSED_AT_MOVEMENT_GRANULARITY],
    /**
     * Represents the event of beginning gesture detection.
     */
    ['gesture_detection_start', ae.TYPE_GESTURE_DETECTION_START],
    /**
     * Represents the event of ending gesture detection.
     */
    ['gesture_detection_end', ae.TYPE_GESTURE_DETECTION_END],
    /**
     * Represents the event of the user starting to touch the screen.
     */
    ['touch_interaction_start', ae.TYPE_TOUCH_INTERACTION_START],
    /**
     * Represents the event of the user ending to touch the screen.
     */
    ['touch_interaction_end', ae.TYPE_TOUCH_INTERACTION_END],
    /**
     * Mask for AccessibilityEvent all types.
     */
    ['all', ae.TYPES_ALL_MASK],
  ]);
}

export class AccessibilityHelper {
  public static BUTTON = 'button';
  public static RADIOBUTTON_CHECKED = 'radiobutton_checked';
  public static RADIOBUTTON_UNCHECKED = 'radiobutton_unchecked';
  public static PLAIN = 'PLAIN';

  public static updateAccessibilityComponentType(tnsView: any, view: android.view.View, componentType: string) {
    switch (componentType) {
      case AccessibilityHelper.BUTTON: {
        view.setAccessibilityDelegate(new ButtonDelegate(tnsView));
        break;
      }
      case AccessibilityHelper.RADIOBUTTON_CHECKED: {
        view.setAccessibilityDelegate(new RadioButtonDelegate(tnsView, true));
        break;
      }
      case AccessibilityHelper.RADIOBUTTON_UNCHECKED: {
        view.setAccessibilityDelegate(new RadioButtonDelegate(tnsView, false));
        break;
      }
      case AccessibilityHelper.PLAIN: {
        view.setAccessibilityDelegate(new PlainDelegate(tnsView));
        break;
      }
      default: {
        AccessibilityHelper.removeAccessibilityComponentType(view);
        break;
      }
    }
  }

  public static removeAccessibilityComponentType(view: android.view.View) {
    view.setAccessibilityDelegate(null);
  }

  public static sendAccessibilityEvent(view: android.view.View, eventName: string, text?: string) {
    if (!eventName) {
      return;
    }

    const a11yService = <android.view.accessibility.AccessibilityManager>view.getContext().getSystemService(android.content.Context.ACCESSIBILITY_SERVICE);
    if (!a11yService.isEnabled()) {
      // console.log(`sendAccessibilityEvent: ACCESSIBILITY_SERVICE is not enabled do nothing for ${eventName} -> ${text}`);
      return;
    }

    ensureAccessibilityEventMap();

    eventName = eventName.toLowerCase();
    const eventInt = accessibilityEventMap.get(eventName);
    if (eventInt === undefined) {
      console.error(`${eventName} is unknown`);
      return;
    }

    const a11yEvent = android.view.accessibility.AccessibilityEvent.obtain(eventInt);
    a11yEvent.setSource(view);

    a11yEvent.getText().clear();

    if (!text) {
      text = view.getContentDescription();
    }

    a11yEvent.getText().add(text);

    a11yService.sendAccessibilityEvent(a11yEvent);
  }
}
