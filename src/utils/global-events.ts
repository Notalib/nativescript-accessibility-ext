/// <reference path="../ui/core/view.d.ts" />

import { EventData, Observable } from '@nativescript/core/data/observable';
import { profile } from '@nativescript/core/profiling';
import { ActionBar } from '@nativescript/core/ui/action-bar';
import { ActivityIndicator } from '@nativescript/core/ui/activity-indicator';
import { Button } from '@nativescript/core/ui/button';
import { ContainerView, CustomLayoutView, View } from '@nativescript/core/ui/core/view';
import { ViewCommon } from '@nativescript/core/ui/core/view/view-common';
import { DatePicker } from '@nativescript/core/ui/date-picker';
import { EditableTextBase } from '@nativescript/core/ui/editable-text-base';
import { Frame } from '@nativescript/core/ui/frame';
import { HtmlView } from '@nativescript/core/ui/html-view';
import { Image } from '@nativescript/core/ui/image';
import { Label } from '@nativescript/core/ui/label';
import { AbsoluteLayout } from '@nativescript/core/ui/layouts/absolute-layout';
import { DockLayout } from '@nativescript/core/ui/layouts/dock-layout';
import { FlexboxLayout } from '@nativescript/core/ui/layouts/flexbox-layout';
import { GridLayout } from '@nativescript/core/ui/layouts/grid-layout';
import { LayoutBase } from '@nativescript/core/ui/layouts/layout-base';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import { WrapLayout } from '@nativescript/core/ui/layouts/wrap-layout';
import { ListPicker } from '@nativescript/core/ui/list-picker';
import { ListView } from '@nativescript/core/ui/list-view';
import { Page } from '@nativescript/core/ui/page';
import { Placeholder } from '@nativescript/core/ui/placeholder';
import { Progress } from '@nativescript/core/ui/progress';
import { Repeater } from '@nativescript/core/ui/repeater';
import { ScrollView } from '@nativescript/core/ui/scroll-view';
import { SearchBar } from '@nativescript/core/ui/search-bar';
import { SegmentedBar } from '@nativescript/core/ui/segmented-bar';
import { Slider } from '@nativescript/core/ui/slider';
import { Switch } from '@nativescript/core/ui/switch';
import { TabView } from '@nativescript/core/ui/tab-view';
import { TextBase } from '@nativescript/core/ui/text-base';
import { TextField } from '@nativescript/core/ui/text-field';
import { TextView } from '@nativescript/core/ui/text-view';
import { TimePicker } from '@nativescript/core/ui/time-picker';
import { WebView } from '@nativescript/core/ui/web-view';
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
    profile(`${viewName}<A11Y>.customNotify`, function customNotify(arg: EventData) {
      if (!ViewClass[obsKeyName].hasListeners(arg.eventName)) {
        return;
      }

      if (isTraceEnabled()) {
        writeGlobalEventsTrace(`Notify "${arg.eventName}" to all "${viewName}" from ${arg.object}`);
      }

      ViewClass[obsKeyName].notify(arg);
    }),
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
setupGlobalEventsOnViewClass(ViewCommon, 'ViewCommon');
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
