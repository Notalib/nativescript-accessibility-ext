import { View } from 'tns-core-modules/ui/core/view';
import { writeTrace, notityAccessibilityFocusState } from './helpers';

const androidNotityAccessibilityFocusState = (owner: View, viewGroup: android.view.ViewGroup, child: android.view.View, event: android.view.accessibility.AccessibilityEvent) => {
  const receivedFocus = event.getEventType() === android.view.accessibility.AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED;
  const lostFocus = event.getEventType() === android.view.accessibility.AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUS_CLEARED;

  if (receivedFocus || lostFocus) {
    notityAccessibilityFocusState(owner, receivedFocus, lostFocus);
  }
};

class AccessibleViewDelegate extends android.view.View.AccessibilityDelegate {
  constructor(private owner: View) {
    super();

    writeTrace(`PlainDelegate: ${owner}`);
    return global.__native(this);
  }

  public onInitializeAccessibilityEvent(host: android.view.View, event: android.view.accessibility.AccessibilityEvent) {
    writeTrace(`PlainDelegate.onInitializeAccessibilityEvent(...)`);

    super.onInitializeAccessibilityEvent(host, event);
  }

  public onInitializeAccessibilityNodeInfo(host: android.view.View, info: android.view.accessibility.AccessibilityNodeInfo) {
    writeTrace(`PlainDelegate.onInitializeAccessibilityNodeInfo(...)`);

    super.onInitializeAccessibilityNodeInfo(host, info);
  }

  /**
   * Handles accessibility Focus/Blur events - If you create new delegates, you need to clone this function... (sorry, {N} won't let you extend native classes twice)
   */
  public onRequestSendAccessibilityEvent(viewGroup: android.view.ViewGroup, child: android.view.View, event: android.view.accessibility.AccessibilityEvent): boolean {
    writeTrace(`PlainDelegate.onRequestSendAccessibilityEvent(...)`);

    androidNotityAccessibilityFocusState(this.owner, viewGroup, child, event);

    return super.onRequestSendAccessibilityEvent(viewGroup, child, event);
  }
}

class ButtonDelegate extends android.view.View.AccessibilityDelegate {
  private className = android.widget.Button.class.getName();
  constructor(private owner: View) {
    super();

    writeTrace(`ButtonDelegate: ${owner}`);
    return global.__native(this);
  }

  public onInitializeAccessibilityEvent(host: android.view.View, event: android.view.accessibility.AccessibilityEvent) {
    writeTrace(`ButtonDelegate.onInitializeAccessibilityEvent(...)`);

    super.onInitializeAccessibilityEvent(host, event);
    event.setClassName(this.className);
  }

  public onInitializeAccessibilityNodeInfo(host: android.view.View, info: android.view.accessibility.AccessibilityNodeInfo) {
    writeTrace(`ButtonDelegate.onInitializeAccessibilityNodeInfo(...)`);

    super.onInitializeAccessibilityNodeInfo(host, info);
    info.setClassName(this.className);
  }

  public onRequestSendAccessibilityEvent(viewGroup: android.view.ViewGroup, child: android.view.View, event: android.view.accessibility.AccessibilityEvent): boolean {
    writeTrace(`ButtonDelegate.onRequestSendAccessibilityEvent(...)`);

    androidNotityAccessibilityFocusState(this.owner, viewGroup, child, event);

    return super.onRequestSendAccessibilityEvent(viewGroup, child, event);
  }
}

class RadioButtonDelegate extends android.view.View.AccessibilityDelegate {
  private className = android.widget.RadioButton.class.getName();
  constructor(private owner: View, private checked: boolean) {
    super();

    writeTrace(`RadioButtonDelegate: ${owner}`);
    return global.__native(this);
  }

  public onInitializeAccessibilityEvent(host: android.view.View, event: android.view.accessibility.AccessibilityEvent) {
    writeTrace(`RadioButtonDelegate.onInitializeAccessibilityNodeInfo(...)`);

    super.onInitializeAccessibilityEvent(host, event);
    event.setClassName(this.className);
    event.setChecked(this.checked);
    writeTrace(`RadioButtonDelegate.onInitializeAccessibilityEvent(...)`);
  }

  public onInitializeAccessibilityNodeInfo(host: android.view.View, info: android.view.accessibility.AccessibilityNodeInfo) {
    writeTrace(`RadioButtonDelegate.onRequestSendAccessibilityEvent(...)`);

    super.onInitializeAccessibilityNodeInfo(host, info);
    info.setClassName(this.className);
    info.setCheckable(true);
    info.setChecked(this.checked);
  }

  public onRequestSendAccessibilityEvent(viewGroup: android.view.ViewGroup, child: android.view.View, event: android.view.accessibility.AccessibilityEvent): boolean {
    writeTrace(`RadioButtonDelegate.onRequestSendAccessibilityEvent(...)`);

    androidNotityAccessibilityFocusState(this.owner, viewGroup, child, event);

    return super.onRequestSendAccessibilityEvent(viewGroup, child, event);
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
  public static get BUTTON() {
    return 'button';
  }

  public static get RADIOBUTTON_CHECKED() {
    return'radiobutton_checked';
  }

  public static get RADIOBUTTON_UNCHECKED() {
    return 'radiobutton_unchecked';
  }

  public static get ACCESSIBLE() {
    return 'accessible';
  }

  public static updateAccessibilityComponentType(tnsView: View, androidView: android.view.View, componentType: string) {
    writeTrace(`updateAccessibilityComponentType: tnsView:${tnsView}, androidView:${androidView} componentType:${componentType}`);

    let delegate: android.view.View.AccessibilityDelegate = null;
    switch (componentType) {
      case AccessibilityHelper.BUTTON: {
        writeTrace(`updateAccessibilityComponentType: tnsView:${tnsView} BUTTON`);

        delegate = new ButtonDelegate(tnsView);
        break;
      }
      case AccessibilityHelper.RADIOBUTTON_CHECKED: {
        writeTrace(`updateAccessibilityComponentType: tnsView:${tnsView} RADIOBUTTON_CHECKED`);

        delegate = new RadioButtonDelegate(tnsView, true);
        break;
      }
      case AccessibilityHelper.RADIOBUTTON_UNCHECKED: {
        writeTrace(`updateAccessibilityComponentType: tnsView:${tnsView} RADIOBUTTON_UNCHECKED`);

        delegate = new RadioButtonDelegate(tnsView, false);
        break;
      }
      case AccessibilityHelper.ACCESSIBLE: {
        writeTrace(`updateAccessibilityComponentType: tnsView:${tnsView} ACCESSIBLE`);

        delegate = new AccessibleViewDelegate(tnsView);
        break;
      }
      default: {
        writeTrace(`updateAccessibilityComponentType: unknown componentType: ${componentType}`);

        AccessibilityHelper.removeAccessibilityComponentType(androidView);
        return;
      }
    }

    writeTrace(`updateAccessibilityComponentType: tnsView:${tnsView}, androidView:${androidView}`);

    try {
      if (delegate) {
        androidView.setAccessibilityDelegate(delegate);
      } else {
        AccessibilityHelper.removeAccessibilityComponentType(androidView);
      }
    } catch (err) {
      console.log('hugo');
      console.dir(err);
      console.log(err);
    }
  }

  public static removeAccessibilityComponentType(androidView: android.view.View) {
    writeTrace('removeAccessibilityComponentType');

    androidView.setAccessibilityDelegate(null);
  }

  public static sendAccessibilityEvent(androidView: android.view.View, eventName: string, text?: string) {
    if (!eventName) {
      writeTrace(`sendAccessibilityEvent: no eventName provided`);
      return;
    }

    const a11yService = <android.view.accessibility.AccessibilityManager>androidView.getContext().getSystemService(android.content.Context.ACCESSIBILITY_SERVICE);
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

    const a11yEvent = android.view.accessibility.AccessibilityEvent.obtain(eventInt);
    a11yEvent.setSource(androidView);

    a11yEvent.getText().clear();

    if (!text) {
      text = androidView.getContentDescription();
      writeTrace(`sendAccessibilityEvent: '${eventName}' text not provided uses androidView.getContentDescription()`);
    }

    writeTrace(`sendAccessibilityEvent: send event: '${eventName}' with text: '${text}'`);

    a11yEvent.getText().add(text);

    a11yService.sendAccessibilityEvent(a11yEvent);
  }
}
