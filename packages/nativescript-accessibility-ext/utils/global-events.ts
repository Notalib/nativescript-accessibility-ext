import {
  AbsoluteLayout,
  ActionBar,
  ActivityIndicator,
  Button,
  ContainerView,
  DatePicker,
  DockLayout,
  EditableTextBase,
  EventData,
  FlexboxLayout,
  Frame,
  GridLayout,
  HtmlView,
  Image,
  Label,
  LayoutBase,
  ListPicker,
  ListView,
  Observable,
  Page,
  Placeholder,
  Progress,
  Repeater,
  ScrollView,
  SearchBar,
  SegmentedBar,
  Slider,
  StackLayout,
  Switch,
  TabView,
  TextBase,
  TextField,
  TextView,
  TimePicker,
  View,
  WebView,
  WrapLayout,
} from '@nativescript/core';
import { CustomLayoutView } from '@nativescript/core/ui/core/view';
import { isTraceEnabled, writeGlobalEventsTrace } from '../trace';
import { unwrapFunction, wrapFunction } from './helpers';

export function setupGlobalEventsOnViewClass(ViewClass: any, viewName: string) {
  const obsKeyName = `__a11y_globalEvent_${viewName}_observable`;

  if (ViewClass[obsKeyName]) {
    if (isTraceEnabled()) {
      writeGlobalEventsTrace(`"${viewName}" already overridden`);
    }

    return;
  }

  if (isTraceEnabled()) {
    writeGlobalEventsTrace(`Adding to "${viewName}"`);
  }

  ViewClass[obsKeyName] = new Observable();

  unwrapFunction(ViewClass.prototype, 'notify', viewName);

  wrapFunction(
    ViewClass.prototype,
    'notify',
    function customNotify(arg: EventData) {
      if (!ViewClass[obsKeyName].hasListeners(arg.eventName)) {
        return;
      }

      if (isTraceEnabled()) {
        writeGlobalEventsTrace(`Notify "${arg.eventName}" to all "${viewName}" from ${arg.object}`);
      }

      ViewClass[obsKeyName].notify(arg);
    },
    viewName,
  );

  ViewClass.on = ViewClass.addEventListener = function customAddEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any) {
    if (isTraceEnabled()) {
      writeGlobalEventsTrace(`On: "${eventNames}" thisArg:${thisArg} to "${viewName}"`);
    }

    ViewClass[obsKeyName].on(eventNames, callback, thisArg);
  };

  ViewClass.once = function customAddOnceEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any) {
    if (isTraceEnabled()) {
      writeGlobalEventsTrace(`Once: "${eventNames}" thisArg:${thisArg} to "${viewName}"`);
    }

    ViewClass[obsKeyName].once(eventNames, callback, thisArg);
  };

  ViewClass.off = ViewClass.removeEventListener = function customRemoveEventListener(eventNames: string, callback?: any, thisArg?: any) {
    if (isTraceEnabled()) {
      writeGlobalEventsTrace(`Remove: "${eventNames}" this:${thisArg} from "${viewName}"`);
    }

    ViewClass[obsKeyName].off(eventNames, callback, thisArg);
  };
}

// Add the global events to the View-class before adding it to the sub-classes.
setupGlobalEventsOnViewClass(View, 'View');
setupGlobalEventsOnViewClass(TextBase, 'TextBase');
setupGlobalEventsOnViewClass(ContainerView, 'ContainerView');
setupGlobalEventsOnViewClass(LayoutBase, 'LayoutBase');

for (const { viewClass, viewName } of [
  { viewClass: AbsoluteLayout, viewName: 'AbsoluteLayout' },
  { viewClass: ActionBar, viewName: 'ActionBar' },
  { viewClass: ActivityIndicator, viewName: 'ActivityIndicator' },
  { viewClass: Button, viewName: 'Button' },
  { viewClass: CustomLayoutView, viewName: 'CustomLayoutView' },
  { viewClass: DatePicker, viewName: 'DatePicker' },
  { viewClass: DockLayout, viewName: 'DockLayout' },
  { viewClass: EditableTextBase, viewName: 'EditableTextBase' },
  { viewClass: FlexboxLayout, viewName: 'FlexboxLayout' },
  { viewClass: Frame, viewName: 'Frame' },
  { viewClass: GridLayout, viewName: 'GridLayout' },
  { viewClass: HtmlView, viewName: 'HtmlView' },
  { viewClass: Image, viewName: 'Image' },
  { viewClass: Label, viewName: 'Label' },
  { viewClass: ListPicker, viewName: 'ListPicker' },
  { viewClass: ListView, viewName: 'ListView' },
  { viewClass: Page, viewName: 'Page' },
  { viewClass: Placeholder, viewName: 'Placeholder' },
  { viewClass: Progress, viewName: 'Progress' },
  { viewClass: Repeater, viewName: 'Repeater' },
  { viewClass: ScrollView, viewName: 'ScrollView' },
  { viewClass: SearchBar, viewName: 'SearchBar' },
  { viewClass: SegmentedBar, viewName: 'SegmentedBar' },
  { viewClass: Slider, viewName: 'Slider' },
  { viewClass: StackLayout, viewName: 'StackLayout' },
  { viewClass: Switch, viewName: 'Switch' },
  { viewClass: TabView, viewName: 'TabView' },
  { viewClass: TextField, viewName: 'TextField' },
  { viewClass: TextView, viewName: 'TextView' },
  { viewClass: TimePicker, viewName: 'TimePicker' },
  { viewClass: WebView, viewName: 'WebView' },
  { viewClass: WrapLayout, viewName: 'WrapLayout' },
]) {
  setupGlobalEventsOnViewClass(viewClass, viewName);
}
