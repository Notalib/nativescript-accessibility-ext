import * as trace from 'tns-core-modules/trace';
import { EventData, View as TNSView } from 'tns-core-modules/ui/core/view';
import { GestureTypes } from 'tns-core-modules/ui/gestures/gestures';
import { ListView } from 'tns-core-modules/ui/list-view/list-view';
import * as utils from 'tns-core-modules/utils/utils';
import { categories, isTraceEnabled, writeErrorTrace, writeTrace } from '../trace';
import { notifyAccessibilityFocusState } from './helpers';
import { isAccessibilityServiceEnabled } from './utils';

function writeHelperTrace(message: string, type = trace.messageType.info) {
  writeTrace(message, type, categories.AndroidHelper);
}

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
const AndroidViewGroup = android.view.ViewGroup;
type AndroidViewGroup = android.view.ViewGroup;
const ViewCompat = android.support.v4.view.ViewCompat;
type ViewCompat = android.support.v4.view.ViewCompat;

function getAccessibilityManager(view: AndroidView): AccessibilityManager {
  return view.getContext().getSystemService(android.content.Context.ACCESSIBILITY_SERVICE);
}

let suspendAccessibilityEvents = false;
const a11yScrollOnFocus = 'a11y-scroll-on-focus';
let lastFocusedView: WeakRef<TNSView>;
function accessibilityEventHelper(owner: TNSView, eventType: number) {
  if (!isAccessibilityServiceEnabled()) {
    return;
  }

  if (!owner) {
    return;
  }

  switch (eventType) {
    case AccessibilityEvent.TYPE_VIEW_CLICKED: {
      /**
       * Android API >= 26 handles accessibility tap-events by converting them to TYPE_VIEW_CLICKED
       * These aren't triggered for custom tap events in NativeScript.
       */
      if (android.os.Build.VERSION.SDK_INT >= 26) {
        // Find all tap gestures and trigger them.
        for (const tapGesture of owner.getGestureObservers(GestureTypes.tap) || []) {
          tapGesture.callback({
            android: owner.android,
            eventName: 'tap',
            ios: null,
            object: owner,
            type: GestureTypes.tap,
            view: owner,
          });
        }
      }

      return;
    }
    case AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED: {
      const lastView = lastFocusedView && lastFocusedView.get();
      if (lastView && owner !== lastView) {
        notifyAccessibilityFocusState(lastView, false, true);
      }

      lastFocusedView = new WeakRef(owner);

      notifyAccessibilityFocusState(owner, true, false);

      const tree = [] as string[];

      for (let node = owner; node; node = node.parent as TNSView) {
        node.notify({
          eventName: a11yScrollOnFocus,
          object: owner,
        });

        tree.push(`${node}[${node.className || ''}]`);
      }

      if (isTraceEnabled()) {
        writeHelperTrace(`Focus-tree: ${tree.reverse().join(' => ')}`);
      }

      return;
    }
    case AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUS_CLEARED: {
      const lastView = lastFocusedView && lastFocusedView.get();
      if (lastView && owner === lastView) {
        lastFocusedView = null;
      }

      notifyAccessibilityFocusState(owner, false, true);
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

    public sendAccessibilityEvent(host: AndroidViewGroup, eventType: number) {
      super.sendAccessibilityEvent(host, eventType);

      if (suspendAccessibilityEvents) {
        return;
      }

      accessibilityEventHelper(this.owner.get(), eventType);
    }

    public onRequestSendAccessibilityEvent(host: AndroidViewGroup, view: AndroidView, event: AccessibilityEvent) {
      return super.onRequestSendAccessibilityEvent(host, view, event);
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
    if (isTraceEnabled()) {
      writeHelperTrace(`updateAccessibilityComponentType: tnsView:${tnsView}, androidView:${androidView} componentType:${componentType}`);
    }

    ensureDelegates();

    if (componentType && androidView[lastComponentTypeSymbol] === componentType) {
      if (isTraceEnabled()) {
        writeHelperTrace(`updateAccessibilityComponentType - ${tnsView} - componentType not changed`);
      }

      if (ViewCompat.hasAccessibilityDelegate(androidView)) {
        return;
      }
    }

    ViewCompat.setAccessibilityDelegate(androidView, new TNSAccessibilityDelegateCompat(tnsView));
    androidView[lastComponentTypeSymbol] = componentType;
  }

  public static removeAccessibilityComponentType(androidView: AndroidView) {
    if (isTraceEnabled()) {
      writeHelperTrace(`removeAccessibilityComponentType from ${androidView}`);
    }

    ViewCompat.setAccessibilityDelegate(androidView, null);
  }

  public static sendAccessibilityEvent(androidView: AndroidView, eventName: string, text?: string) {
    const cls = `AccessibilityHelper.sendAccessibilityEvent(${androidView}, ${eventName}, ${text})`;
    if (!eventName) {
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls}: no eventName provided`);
      }
      return;
    }

    if (!isAccessibilityServiceEnabled()) {
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls} - TalkBack not enabled`);
      }
      return;
    }

    const a11yService = getAccessibilityManager(androidView);
    if (!a11yService.isEnabled()) {
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls} - a11yService not enabled`);
      }
      return;
    }

    ensureAccessibilityEventMap();

    eventName = eventName.toLowerCase();
    if (!accessibilityEventMap.has(eventName)) {
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls} - unknown event`);
      }
      return;
    }
    const eventInt = accessibilityEventMap.get(eventName);

    const a11yEvent = AccessibilityEvent.obtain(eventInt);
    a11yEvent.setSource(androidView);

    a11yEvent.getText().clear();

    if (!text) {
      text = androidView.getContentDescription();
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls} - text not provided use androidView.getContentDescription()`);
      }
    }

    if (isTraceEnabled()) {
      writeHelperTrace(`${cls}: send event with text: '${JSON.stringify(text)}'`);
    }

    if (text) {
      a11yEvent.getText().add(text);
    }

    a11yService.sendAccessibilityEvent(a11yEvent);
  }

  public static updateContentDescription(tnsView: TNSView, androidView: AndroidView) {
    const cls = `AccessibilityHelper.updateContentDescription(${tnsView}, ${androidView}`;

    let contentDescriptionBuilder: string[] = [];
    let haveValue = false;
    if (tnsView.accessibilityLabel) {
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls} - have accessibilityLabel`);
      }
      haveValue = true;
      contentDescriptionBuilder.push(`${tnsView.accessibilityLabel}. `);
    }

    if (tnsView.accessibilityValue) {
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls} - have accessibilityValue`);
      }
      haveValue = true;
      contentDescriptionBuilder.push(`${tnsView.accessibilityValue}. `);
    }

    if (tnsView.accessibilityHint) {
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls} - have accessibilityHint`);
      }
      haveValue = true;
      contentDescriptionBuilder.push(`${tnsView.accessibilityHint}. `);
    }

    const contentDescription = contentDescriptionBuilder
      .join('')
      .trim()
      .replace(/^\.$/, '');

    if (contentDescription !== androidView.getContentDescription()) {
      if (haveValue) {
        if (isTraceEnabled()) {
          writeHelperTrace(`${cls} - set to "${contentDescription}"`);
        }
        androidView.setContentDescription(contentDescription);
      } else {
        if (isTraceEnabled()) {
          writeHelperTrace(`${cls} - remove value`);
        }
        androidView.setContentDescription(null);
      }
    } else {
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls} - no change`);
      }
    }

    return contentDescription;
  }
}

/**
 * When the user navigates to a ListView item, we need to keep it on screen.
 * Otherwise we risk buggy behavior, where the ListView jumps to the top or selects a < half
 * visible element.
 */
function ensureListViewItemIsOnScreen(listView: ListView, index: number, event: EventData) {
  const view = event.object as TNSView;

  if (isTraceEnabled()) {
    writeHelperTrace(`ItemOnScreen${listView}: index=${index} view=${view}`);
  }
  if (suspendAccessibilityEvents) {
    if (isTraceEnabled()) {
      writeHelperTrace(`ItemOnScreen${listView}: index=${index} suspended`);
    }
    return;
  }

  try {
    suspendAccessibilityEvents = true;
    const androidListView = listView.android as android.widget.ListView;
    if (!androidListView) {
      // This really shouldn't happen, but just in case.
      if (isTraceEnabled()) {
        writeHelperTrace(`ItemOnScreen${listView}: index=${index} no native list-view?`);
      }
      return;
    }

    const viewSize = view.getActualSize();
    const viewPos = view.getLocationRelativeTo(listView);
    const listViewSize = listView.getActualSize();

    const viewPosDelta = {
      x2: viewSize.width + viewPos.x,
      y2: viewSize.height + viewPos.y,
    };

    // To make sure the prev/next element exists add a small padding
    const offsetPadding = 10;

    // Minimum y-offset for the view to be on screen.
    const minOffset = offsetPadding;

    // Maximum y-offset for the view to be on screen
    const maxOffset = listViewSize.height - offsetPadding;

    if (viewPos.y >= minOffset && viewPosDelta.y2 <= maxOffset) {
      // The view is on screen, no need to scroll anything.
      if (isTraceEnabled()) {
        writeHelperTrace(`ItemOnScreen${listView}: index=${index} is on screen ${viewPos.y} >= ${minOffset} && ${viewPosDelta.y2} <= ${maxOffset}`);
      }

      return;
    }

    /**
     * The ListView needs to be scrolled.
     *
     * ListView can only be scrolled relative to the current position,
     * so we need to calculate the relative scrollBy value.
     */

    // 1st calculate at which offset the view should end up at.
    const wantedScrollOffset = viewPos.y < 0 ? offsetPadding : listViewSize.height - viewSize.height - offsetPadding;

    // 2nd calculate the difference between the current y-offset and the wanted offset.
    const scrollByDIP = viewPos.y - wantedScrollOffset;

    // 3nd convert to real device pixels.
    const scrollByDP = utils.layout.toDevicePixels(scrollByDIP);

    if (isTraceEnabled()) {
      writeHelperTrace(`ItemOnScreen${listView}: index=${index} is not on screen, scroll by: ${scrollByDIP}`);
    }

    // Finally scroll this ListView.
    // Note: We get a better result from ListViewCompat.scrollListBy than from ListView.scrollListBy.
    android.support.v4.widget.ListViewCompat.scrollListBy(androidListView, scrollByDP);
  } catch (err) {
    writeErrorTrace(err);
  } finally {
    suspendAccessibilityEvents = false;
  }
}

/**
 * Set the ListView item's AccessibilityDelegate on load. this is needed to scroll into view.
 */
function listViewItemLoaded(event: EventData) {
  const tnsView = event.object as TNSView;
  if (!tnsView.android) {
    return;
  }

  ViewCompat.setAccessibilityDelegate(tnsView.android, new TNSAccessibilityDelegateCompat(tnsView));
}

ListView.on(ListView.itemLoadingEvent, (args: any) => {
  const listView = args.object as ListView;
  const index = args.index as number;
  const tnsView = args.view as TNSView;

  if (isTraceEnabled()) {
    writeHelperTrace(`ItemLoading${listView}: index=${index} view=${tnsView}`);
  }

  if (!tnsView) {
    return;
  }

  tnsView.off(a11yScrollOnFocus);

  tnsView.on(a11yScrollOnFocus, ensureListViewItemIsOnScreen.bind(null, listView, index));

  for (let p = tnsView; p && p !== listView; p = p.parent as TNSView) {
    p.off(TNSView.loadedEvent, listViewItemLoaded);

    if (!p.isLoaded) {
      if (isTraceEnabled()) {
        writeHelperTrace(`ItemLoading${listView}: index=${index} view is not loaded`);
      }
      p.on(TNSView.loadedEvent, listViewItemLoaded);
      continue;
    }

    const androidView = p.android as AndroidView;
    if (!androidView) {
      continue;
    }

    if (ViewCompat.hasAccessibilityDelegate(androidView)) {
      if (isTraceEnabled()) {
        writeHelperTrace(`ItemLoading${listView}: index=${index} view already has a delegate`);
      }
      continue;
    }

    ViewCompat.setAccessibilityDelegate(androidView, new TNSAccessibilityDelegateCompat(tnsView));
  }
});
