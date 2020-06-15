/// <reference path="../ui/core/view.d.ts" />

import { EventData, Observable } from '@nativescript/core/data/observable/observable';
import { profile } from '@nativescript/core/profiling';
import { ActionBar } from '@nativescript/core/ui/action-bar/action-bar';
import { ActivityIndicator } from '@nativescript/core/ui/activity-indicator/activity-indicator';
import { Button } from '@nativescript/core/ui/button/button';
import { View } from '@nativescript/core/ui/core/view/view';
import { DatePicker } from '@nativescript/core/ui/date-picker/date-picker';
import { EditableTextBase } from '@nativescript/core/ui/editable-text-base/editable-text-base';
import { ContainerView, CustomLayoutView, Frame } from '@nativescript/core/ui/frame/frame';
import { HtmlView } from '@nativescript/core/ui/html-view/html-view';
import { Image } from '@nativescript/core/ui/image/image';
import { Label } from '@nativescript/core/ui/label';
import { AbsoluteLayout } from '@nativescript/core/ui/layouts/absolute-layout/absolute-layout';
import { DockLayout } from '@nativescript/core/ui/layouts/dock-layout/dock-layout';
import { FlexboxLayout } from '@nativescript/core/ui/layouts/flexbox-layout/flexbox-layout';
import { GridLayout } from '@nativescript/core/ui/layouts/grid-layout/grid-layout';
import { LayoutBase } from '@nativescript/core/ui/layouts/layout-base';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout/stack-layout';
import { WrapLayout } from '@nativescript/core/ui/layouts/wrap-layout/wrap-layout';
import { ListPicker } from '@nativescript/core/ui/list-picker/list-picker';
import { ListView } from '@nativescript/core/ui/list-view/list-view';
import { Page } from '@nativescript/core/ui/page/page';
import { Placeholder } from '@nativescript/core/ui/placeholder/placeholder';
import { Progress } from '@nativescript/core/ui/progress/progress';
import { Repeater } from '@nativescript/core/ui/repeater/repeater';
import { ScrollView } from '@nativescript/core/ui/scroll-view/scroll-view';
import { SearchBar } from '@nativescript/core/ui/search-bar/search-bar';
import { SegmentedBar } from '@nativescript/core/ui/segmented-bar/segmented-bar';
import { Slider } from '@nativescript/core/ui/slider/slider';
import { Switch } from '@nativescript/core/ui/switch/switch';
import { TabView } from '@nativescript/core/ui/tab-view/tab-view';
import { TextBase } from '@nativescript/core/ui/text-base/text-base';
import { TextField } from '@nativescript/core/ui/text-field/text-field';
import { TextView } from '@nativescript/core/ui/text-view/text-view';
import { TimePicker } from '@nativescript/core/ui/time-picker/time-picker';
import { WebView } from '@nativescript/core/ui/web-view/web-view';
import { isTraceEnabled, writeGlobalEventsTrace } from '../trace';
import { ViewCommon } from '../ui/core/view-common';
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
