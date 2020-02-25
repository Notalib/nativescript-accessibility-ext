import * as nsApp from '@nativescript/core/application';
import { profile } from '@nativescript/core/profiling';
import * as trace from '@nativescript/core/trace';
import { View as TNSView } from '@nativescript/core/ui/core/view';
import { GestureTypes } from '@nativescript/core/ui/gestures/gestures';
import { ListView } from '@nativescript/core/ui/list-view/list-view';
import { ProxyViewContainer } from '@nativescript/core/ui/proxy-view-container';
import * as utils from '@nativescript/core/utils/utils';
import { categories, isTraceEnabled, writeErrorTrace, writeTrace } from '../trace';
import { AccessibilityRole, AccessibilityState } from '../ui/core/view-common';
import { hmrSafeGlobalEvents, notifyAccessibilityFocusState } from './helpers';
import { isAccessibilityServiceEnabled } from './utils';

function writeHelperTrace(message: string, type = trace.messageType.info) {
  writeTrace(message, type, categories.AndroidHelper);
}

export const getAndroidView = profile('getAndroidView', function getAndroidViewImpl<T extends android.view.View>(tnsView: TNSView): T {
  return tnsView.nativeView || tnsView.nativeViewProtected;
});

export function getUIView(tnsView: TNSView): UIView {
  throw new Error(`getUIView(${tnsView}) - should never be called on Android`);
}

const AccessibilityEvent = android.view.accessibility.AccessibilityEvent;
type AccessibilityEvent = android.view.accessibility.AccessibilityEvent;
const AccessibilityManager = android.view.accessibility.AccessibilityManager;
type AccessibilityManager = android.view.accessibility.AccessibilityManager;
let AccessibilityDelegate = android.view.View.androidviewViewAccessibilityDelegate;
AccessibilityDelegate = (android.view.View as any).AccessibilityDelegate;
type AccessibilityDelegate = android.view.View.AccessibilityDelegate;
const AccessibilityNodeInfo = android.view.accessibility.AccessibilityNodeInfo;
type AccessibilityNodeInfo = android.view.accessibility.AccessibilityNodeInfo;
const AndroidView = android.view.View;
type AndroidView = android.view.View;
const AndroidViewGroup = android.view.ViewGroup;
type AndroidViewGroup = android.view.ViewGroup;
let clickableRolesMap = new Set<string>();

const getAccessibilityManager = profile('getAccessibilityManager', function getAccessibilityManagerImpl(view: AndroidView): AccessibilityManager {
  return view.getContext().getSystemService(android.content.Context.ACCESSIBILITY_SERVICE);
});

let suspendAccessibilityEvents = false;
const a11yScrollOnFocus = 'a11y-scroll-on-focus';
let lastFocusedView: WeakRef<TNSView>;
const accessibilityEventHelper = profile('accessibilityEventHelper', function accessibilityEventHelperImpl(tnsView: TNSView, eventType: number) {
  const eventName = accessibilityEventTypeMap.get(eventType);
  if (!isAccessibilityServiceEnabled()) {
    if (isTraceEnabled()) {
      writeHelperTrace(`accessibilityEventHelper: Service not active`);
    }

    return;
  }

  if (!eventName) {
    writeHelperTrace(`accessibilityEventHelper: unknown eventType: ${eventType}`, trace.messageType.error);

    return;
  }

  if (!tnsView) {
    if (isTraceEnabled()) {
      writeHelperTrace(`accessibilityEventHelper: no owner: ${eventName}`);
    }

    return;
  }
  const androidView = getAndroidView(tnsView);
  if (!androidView) {
    if (isTraceEnabled()) {
      writeHelperTrace(`accessibilityEventHelper: no nativeView`);
    }

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
        for (const tapGesture of tnsView.getGestureObservers(GestureTypes.tap) || []) {
          tapGesture.callback({
            android: tnsView.android,
            eventName: 'tap',
            ios: null,
            object: tnsView,
            type: GestureTypes.tap,
            view: tnsView,
          });
        }
      }

      return;
    }
    case AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED: {
      const lastView = lastFocusedView && lastFocusedView.get();
      if (lastView && tnsView !== lastView) {
        const lastAndroidView = getAndroidView(lastView);
        if (lastAndroidView) {
          lastAndroidView.clearFocus();
          lastFocusedView = null;

          notifyAccessibilityFocusState(lastView, false, true);
        }
      }

      lastFocusedView = new WeakRef(tnsView);

      notifyAccessibilityFocusState(tnsView, true, false);

      const tree = [] as string[];

      for (let node = tnsView; node; node = node.parent as TNSView) {
        node.notify({
          eventName: a11yScrollOnFocus,
          object: tnsView,
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
      if (lastView && tnsView === lastView) {
        lastFocusedView = null;
        androidView.clearFocus();
      }

      notifyAccessibilityFocusState(tnsView, false, true);

      return;
    }
  }
});

let TNSAccessibilityDelegate: AccessibilityDelegate;

const androidViewToTNSView = new WeakMap<AndroidView, WeakRef<TNSView>>();

let accessibilityEventMap: Map<string, number>;
let accessibilityEventTypeMap: Map<number, string>;
function ensureNativeClasses() {
  if (TNSAccessibilityDelegate) {
    return;
  }

  const RoleTypeMap = new Map<AccessibilityRole, string>([
    [AccessibilityRole.Button, android.widget.Button.class.getName()],
    [AccessibilityRole.Search, android.widget.EditText.class.getName()],
    [AccessibilityRole.Image, android.widget.ImageView.class.getName()],
    [AccessibilityRole.ImageButton, android.widget.ImageButton.class.getName()],
    [AccessibilityRole.KeyboardKey, android.inputmethodservice.Keyboard.Key.class.getName()],
    [AccessibilityRole.StaticText, android.widget.TextView.class.getName()],
    [AccessibilityRole.Adjustable, android.widget.SeekBar.class.getName()],
    [AccessibilityRole.Checkbox, android.widget.CheckBox.class.getName()],
    [AccessibilityRole.RadioButton, android.widget.RadioButton.class.getName()],
    [AccessibilityRole.SpinButton, android.widget.Spinner.class.getName()],
    [AccessibilityRole.Switch, android.widget.Switch.class.getName()],
    [AccessibilityRole.ProgressBar, android.widget.ProgressBar.class.getName()],
  ]);

  clickableRolesMap = new Set<string>([AccessibilityRole.Button, AccessibilityRole.ImageButton]);

  const ignoreRoleTypesForTrace = new Set([AccessibilityRole.Header, AccessibilityRole.Link, AccessibilityRole.None, AccessibilityRole.Summary]);

  class TNSAccessibilityDelegateImpl extends AccessibilityDelegate {
    constructor() {
      super();

      return global.__native(this);
    }

    private getTnsView(view: AndroidView) {
      if (!androidViewToTNSView.has(view)) {
        return null;
      }

      const tnsView = androidViewToTNSView.get(view).get();
      if (!tnsView) {
        androidViewToTNSView.delete(view);

        return null;
      }

      return tnsView;
    }

    public onInitializeAccessibilityNodeInfo(host: AndroidView, info: AccessibilityNodeInfo) {
      super.onInitializeAccessibilityNodeInfo(host, info);

      const tnsView = this.getTnsView(host);
      if (!tnsView) {
        if (isTraceEnabled()) {
          writeHelperTrace(`onInitializeAccessibilityNodeInfo ${host} ${info} no tns-view`);
        }

        return;
      }

      const accessibilityRole = tnsView.accessibilityRole as AccessibilityRole;
      if (accessibilityRole) {
        const androidClassName = RoleTypeMap.get(accessibilityRole);
        if (androidClassName) {
          const oldClassName = info.getClassName() || (android.os.Build.VERSION.SDK_INT >= 28 && host.getAccessibilityClassName()) || null;
          info.setClassName(androidClassName);

          if (isTraceEnabled()) {
            writeHelperTrace(
              `${tnsView}.accessibilityRole = "${accessibilityRole}" is mapped to "${androidClassName}" (was ${oldClassName}). ${info.getClassName()}`,
            );
          }
        } else if (!ignoreRoleTypesForTrace.has(accessibilityRole as AccessibilityRole)) {
          if (isTraceEnabled()) {
            writeHelperTrace(`${tnsView}.accessibilityRole = "${accessibilityRole}" is unknown`);
          }
        }

        if (clickableRolesMap.has(accessibilityRole)) {
          if (isTraceEnabled()) {
            writeHelperTrace(`onInitializeAccessibilityNodeInfo ${tnsView} - set clickable role=${accessibilityRole}`);
          }

          info.setClickable(true);
        }

        if (android.os.Build.VERSION.SDK_INT >= 28) {
          if (accessibilityRole === AccessibilityRole.Header) {
            if (isTraceEnabled()) {
              writeHelperTrace(`onInitializeAccessibilityNodeInfo ${tnsView} - set heading role=${accessibilityRole}`);
            }

            info.setHeading(true);
          } else if (host.isAccessibilityHeading()) {
            if (isTraceEnabled()) {
              writeHelperTrace(`onInitializeAccessibilityNodeInfo ${tnsView} - set heading from host`);
            }

            info.setHeading(true);
          } else {
            if (isTraceEnabled()) {
              writeHelperTrace(`onInitializeAccessibilityNodeInfo ${tnsView} - set not heading`);
            }

            info.setHeading(false);
          }
        }

        switch (accessibilityRole) {
          case AccessibilityRole.Switch:
          case AccessibilityRole.RadioButton:
          case AccessibilityRole.Checkbox: {
            if (isTraceEnabled()) {
              writeHelperTrace(
                `onInitializeAccessibilityNodeInfo ${tnsView} - set checkable and check=${tnsView.accessibilityState === AccessibilityState.Checked}`,
              );
            }

            info.setCheckable(true);
            info.setChecked(tnsView.accessibilityState === AccessibilityState.Checked);
            break;
          }
          default: {
            if (isTraceEnabled()) {
              writeHelperTrace(
                `onInitializeAccessibilityNodeInfo ${tnsView} - set enabled=${tnsView.accessibilityState !==
                  AccessibilityState.Disabled} and selected=${tnsView.accessibilityState === AccessibilityState.Selected}`,
              );
            }

            info.setEnabled(tnsView.accessibilityState !== AccessibilityState.Disabled);
            info.setSelected(tnsView.accessibilityState === AccessibilityState.Selected);
            break;
          }
        }
      }

      if (tnsView.accessible === true) {
        info.setFocusable(true);
      }
    }

    public onInitializeAccessibilityEvent(view: AndroidView, event: AccessibilityEvent) {
      // for debugger
      super.onInitializeAccessibilityEvent(view, event);
    }

    public onPopulateAccessibilityEvent(view: AndroidView, event: AccessibilityEvent) {
      // for debugger
      super.onPopulateAccessibilityEvent(view, event);
    }

    public dispatchPopulateAccessibilityEvent(view: AndroidView, event: AccessibilityEvent) {
      // for debugger
      return super.dispatchPopulateAccessibilityEvent(view, event);
    }

    public sendAccessibilityEvent(host: AndroidViewGroup, eventType: number) {
      super.sendAccessibilityEvent(host, eventType);
      const tnsView = this.getTnsView(host);
      if (!tnsView) {
        console.log(`skip - ${host} - ${accessibilityEventTypeMap.get(eventType)}`);

        return;
      }

      if (suspendAccessibilityEvents) {
        if (isTraceEnabled()) {
          writeHelperTrace(`sendAccessibilityEvent: ${tnsView} - skip`);
        }

        return;
      }

      try {
        accessibilityEventHelper(tnsView, eventType);
      } catch (err) {
        console.error(err);
      }
    }

    public onRequestSendAccessibilityEvent(host: AndroidViewGroup, view: AndroidView, event: AccessibilityEvent) {
      if (suspendAccessibilityEvents) {
        return false;
      }

      return super.onRequestSendAccessibilityEvent(host, view, event);
    }
  }

  TNSAccessibilityDelegate = new TNSAccessibilityDelegateImpl();

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

  accessibilityEventTypeMap = new Map([...accessibilityEventMap].map(([k, v]) => [v, k]));
}

export class AccessibilityHelper {
  @profile
  public static updateAccessibilityProperties(tnsView: TNSView) {
    if (tnsView instanceof ProxyViewContainer) {
      return null;
    }

    setAccessibilityDelegate(tnsView);
    applyContentDescription(tnsView);
  }

  @profile
  public static sendAccessibilityEvent(tnsView: TNSView, eventName: string, text?: string) {
    const cls = `AccessibilityHelper.sendAccessibilityEvent(${tnsView}, ${eventName}, ${text})`;

    const androidView = getAndroidView(tnsView);
    if (!androidView) {
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls}: no nativeView`);
      }

      return;
    }

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

    eventName = eventName.toLowerCase();
    if (!accessibilityEventMap.has(eventName)) {
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls} - unknown event`);
      }

      return;
    }
    const eventInt = accessibilityEventMap.get(eventName);

    if (!text) {
      return androidView.sendAccessibilityEvent(eventInt);
    }

    const a11yEvent = AccessibilityEvent.obtain(eventInt);
    a11yEvent.setSource(androidView);

    a11yEvent.getText().clear();

    if (!text) {
      applyContentDescription(tnsView);

      text = androidView.getContentDescription() || tnsView['title'];
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls} - text not provided use androidView.getContentDescription() - ${text}`);
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

  @profile
  public static updateContentDescription(tnsView: TNSView, forceUpdate = false) {
    if (tnsView instanceof ProxyViewContainer) {
      return null;
    }

    return applyContentDescription(tnsView, forceUpdate);
  }
}

const removeAccessibilityDelegate = profile('removeAccessibilityDelegate', function removeAccessibilityDelegateImpl(tnsView: TNSView) {
  if (tnsView instanceof ProxyViewContainer) {
    return null;
  }

  const androidView = getAndroidView(tnsView);
  if (!androidView) {
    return;
  }

  androidViewToTNSView.delete(androidView);
  androidView.setAccessibilityDelegate(null);
});

const setAccessibilityDelegate = profile('setAccessibilityDelegate', function setAccessibilityDelegateImpl(tnsView: TNSView) {
  if (tnsView instanceof ProxyViewContainer) {
    return null;
  }

  ensureNativeClasses();

  const androidView = getAndroidView(tnsView);
  if (!androidView) {
    return;
  }

  androidViewToTNSView.set(androidView, new WeakRef(tnsView));

  const hasOldDelegate = androidView.getAccessibilityDelegate() === TNSAccessibilityDelegate;

  const cls = `AccessibilityHelper.updateAccessibilityProperties(${tnsView}) - has delegate? ${hasOldDelegate}`;
  if (isTraceEnabled()) {
    writeHelperTrace(cls);
  }

  if (hasOldDelegate) {
    return;
  }

  androidView.setAccessibilityDelegate(TNSAccessibilityDelegate);
});

const applyContentDescription = profile('applyContentDescription', function applyContentDescriptionImpl(tnsView: TNSView, forceUpdate?: boolean) {
  if (tnsView instanceof ProxyViewContainer) {
    return null;
  }

  let androidView: android.view.View = getAndroidView(tnsView);

  if (androidView instanceof androidx.appcompat.widget.Toolbar) {
    const numChildren = androidView.getChildCount();

    for (let i = 0; i < numChildren; i += 1) {
      const childAndroidView = androidView.getChildAt(i);
      if (childAndroidView instanceof androidx.appcompat.widget.AppCompatTextView) {
        androidView = childAndroidView;
        break;
      }
    }
  }

  const cls = `applyContentDescription(${tnsView})`;

  if (!androidView) {
    if (isTraceEnabled()) {
      writeErrorTrace(`${cls} - no native element`);
    }

    return null;
  }

  const titleValue = tnsView['title'] as string;
  const textValue = tnsView['text'] as string;

  if (!forceUpdate && tnsView._androidContentDescriptionUpdated === false && textValue === tnsView['_lastText'] && titleValue === tnsView['_lastTitle']) {
    // prevent updating this too much
    return androidView.getContentDescription();
  }

  let contentDescriptionBuilder: string[] = [];

  // Workaround: TalkBack won't read the checked state for fake Switch.
  if (tnsView.accessibilityRole === AccessibilityRole.Switch) {
    const androidSwitch = new android.widget.Switch(nsApp.android.context);
    if (tnsView.accessibilityState === AccessibilityState.Checked) {
      contentDescriptionBuilder.push(androidSwitch.getTextOn());
    } else {
      contentDescriptionBuilder.push(androidSwitch.getTextOff());
    }
  }

  if (tnsView.accessibilityLabel) {
    if (isTraceEnabled()) {
      writeHelperTrace(`${cls} - have accessibilityLabel`);
    }

    contentDescriptionBuilder.push(`${tnsView.accessibilityLabel}`);
  }

  if (tnsView.accessibilityValue) {
    if (isTraceEnabled()) {
      writeHelperTrace(`${cls} - have accessibilityValue`);
    }

    contentDescriptionBuilder.push(`${tnsView.accessibilityValue}`);
  } else if (textValue) {
    if (textValue !== tnsView.accessibilityLabel) {
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls} - don't have accessibilityValue - use 'text' value`);
      }

      contentDescriptionBuilder.push(`${textValue}`);
    }
  } else if (titleValue) {
    if (titleValue !== tnsView.accessibilityLabel) {
      if (isTraceEnabled()) {
        writeHelperTrace(`${cls} - don't have accessibilityValue - use 'title' value`);
      }

      contentDescriptionBuilder.push(`${titleValue}`);
    }
  }

  if (tnsView.accessibilityHint) {
    if (isTraceEnabled()) {
      writeHelperTrace(`${cls} - have accessibilityHint`);
    }

    contentDescriptionBuilder.push(`${tnsView.accessibilityHint}`);
  }

  const contentDescription = contentDescriptionBuilder
    .join('. ')
    .trim()
    .replace(/^\.$/, '');

  if (contentDescription) {
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

  tnsView['_lastTitle'] = titleValue;
  tnsView['_lastText'] = textValue;
  tnsView._androidContentDescriptionUpdated = false;

  return contentDescription;
});

/**
 * When the user navigates to a ListView item, we need to keep it on screen.
 * Otherwise we risk buggy behavior, where the ListView jumps to the top or selects a < half
 * visible element.
 */
const ensureListViewItemIsOnScreen = profile('ensureListViewItemIsOnScreen', function ensureListViewItemIsOnScreenImpl(listView: ListView, tnsView: TNSView) {
  if (suspendAccessibilityEvents) {
    if (isTraceEnabled()) {
      writeHelperTrace(`ensureListViewItemIsOnScreen(${listView}, ${tnsView}) suspended`);
    }

    return;
  }

  if (isTraceEnabled()) {
    writeHelperTrace(`ensureListViewItemIsOnScreen(${listView}, ${tnsView})`);
  }

  const androidListView = getAndroidView(listView) as android.widget.ListView;
  if (!androidListView) {
    // This really shouldn't happen, but just in case.
    if (isTraceEnabled()) {
      writeHelperTrace(`ensureListViewItemIsOnScreen(${listView}, ${tnsView}) no native list-view?`);
    }

    return;
  }

  const androidView = getAndroidView(tnsView);
  if (!androidView) {
    // This really shouldn't happen, but just in case.
    if (isTraceEnabled()) {
      writeHelperTrace(`ensureListViewItemIsOnScreen(${listView}, ${tnsView}) no native item view?`);
    }

    return;
  }

  try {
    // Remove Accessibility delegate to prevent infinite loop triggered by the events.
    removeAccessibilityDelegate(tnsView);

    suspendAccessibilityEvents = true;

    const viewSize = tnsView.getActualSize();
    const viewPos = tnsView.getLocationRelativeTo(listView);
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
        writeHelperTrace(
          `ensureListViewItemIsOnScreen(${listView}, ${tnsView}) view is on screen ${viewPos.y} >= ${minOffset} && ${viewPosDelta.y2} <= ${maxOffset}`,
        );
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
      writeHelperTrace(`ensureListViewItemIsOnScreen(${listView}, ${tnsView}) view is not on screen, scroll by: ${scrollByDIP}`);
    }

    // Finally scroll this ListView.
    // Note: We get a better result from ListViewCompat.scrollListBy than from ListView.scrollListBy.
    androidx.core.widget.ListViewCompat.scrollListBy(androidListView, scrollByDP);
  } catch (err) {
    writeErrorTrace(err);
  } finally {
    suspendAccessibilityEvents = false;

    // Reset accessibility
    AccessibilityHelper.updateAccessibilityProperties(tnsView);
  }
});

function setupA11yScrollOnFocus(args: any) {
  const listView = args.object as ListView;
  const tnsView = args.view as TNSView;

  if (!tnsView) {
    return;
  }

  // Ensure accessibility delegate is still applied. This is to solve #NOTA-6866
  setAccessibilityDelegate(tnsView);

  if (tnsView.hasListeners(a11yScrollOnFocus)) {
    if (isTraceEnabled()) {
      writeHelperTrace(`setupA11yScrollOnFocus(): ${listView} view=${tnsView} - item already has ${a11yScrollOnFocus}`);
    }

    return;
  }

  if (isTraceEnabled()) {
    writeHelperTrace(`setupA11yScrollOnFocus(): ${listView} view=${tnsView}`);
  }

  const listViewRef = new WeakRef(listView);
  tnsView.on(a11yScrollOnFocus, function(this: null, evt) {
    const localListView = listViewRef.get();
    if (!localListView) {
      evt.object.off(a11yScrollOnFocus);

      return;
    }

    ensureListViewItemIsOnScreen(localListView, evt.object as TNSView);
  });
}

hmrSafeGlobalEvents('setupA11yScrollOnFocus', [ListView.itemLoadingEvent], ListView, setupA11yScrollOnFocus);
hmrSafeGlobalEvents('setAccessibilityDelegate:loadedEvent', [TNSView.loadedEvent], TNSView, function(this: null, evt) {
  // Set the accessibility delegate on load.
  AccessibilityHelper.updateAccessibilityProperties(evt.object);
});
