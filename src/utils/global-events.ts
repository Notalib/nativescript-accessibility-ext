import { EventData, Observable } from 'tns-core-modules/data/observable/observable';
import { ActionBar } from 'tns-core-modules/ui/action-bar/action-bar';
import { ActivityIndicator } from 'tns-core-modules/ui/activity-indicator/activity-indicator';
import { Button } from 'tns-core-modules/ui/button/button';
import { View } from 'tns-core-modules/ui/core/view/view';
import { DatePicker } from 'tns-core-modules/ui/date-picker/date-picker';
import { EditableTextBase } from 'tns-core-modules/ui/editable-text-base/editable-text-base';
import { Frame } from 'tns-core-modules/ui/frame/frame';
import { HtmlView } from 'tns-core-modules/ui/html-view/html-view';
import { Image } from 'tns-core-modules/ui/image/image';
import { AbsoluteLayout } from 'tns-core-modules/ui/layouts/absolute-layout/absolute-layout';
import { DockLayout } from 'tns-core-modules/ui/layouts/dock-layout/dock-layout';
import { FlexboxLayout } from 'tns-core-modules/ui/layouts/flexbox-layout/flexbox-layout';
import { GridLayout } from 'tns-core-modules/ui/layouts/grid-layout/grid-layout';
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout/stack-layout';
import { WrapLayout } from 'tns-core-modules/ui/layouts/wrap-layout/wrap-layout';
import { ListPicker } from 'tns-core-modules/ui/list-picker/list-picker';
import { ListView } from 'tns-core-modules/ui/list-view/list-view';
import { Page } from 'tns-core-modules/ui/page/page';
import { Progress } from 'tns-core-modules/ui/progress/progress';
import { Repeater } from 'tns-core-modules/ui/repeater/repeater';
import { ScrollView } from 'tns-core-modules/ui/scroll-view/scroll-view';
import { SearchBar } from 'tns-core-modules/ui/search-bar/search-bar';
import { SegmentedBar } from 'tns-core-modules/ui/segmented-bar/segmented-bar';
import { Slider } from 'tns-core-modules/ui/slider/slider';
import { Switch } from 'tns-core-modules/ui/switch/switch';
import { TabView } from 'tns-core-modules/ui/tab-view/tab-view';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { TextView } from 'tns-core-modules/ui/text-view/text-view';
import { TimePicker } from 'tns-core-modules/ui/time-picker/time-picker';
import { WebView } from 'tns-core-modules/ui/web-view/web-view';
import { isTraceEnabled, writeGlobalEventsTrace } from '../trace';
import { wrapViewFunction } from './helpers';

export function setupGlobalEventsOnViewType(View: any) {
  const viewName = View.name;

  if (isTraceEnabled()) {
    writeGlobalEventsTrace(`Adding to: ${viewName}`);
  }

  const observable = new Observable();
  wrapViewFunction(View, 'notify', function customNotify(arg: EventData) {
    if (isTraceEnabled()) {
      writeGlobalEventsTrace(`Notify "${arg.eventName}" to all "${viewName}"`);
    }

    observable.notify(arg);
  });

  View.on = View.addEventListener = function customAddEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any) {
    if (isTraceEnabled()) {
      writeGlobalEventsTrace(`On: "${eventNames}" this:${thisArg} to "${viewName}"`);
    }
    observable.on(eventNames, callback, thisArg);
  };

  View.once = function customAddOnceEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any) {
    if (isTraceEnabled()) {
      writeGlobalEventsTrace(`Once: "${eventNames}" this:${thisArg} to "${viewName}"`);
    }
    observable.once(eventNames, callback, thisArg);
  };

  View.off = View.removeEventListener = function customRemoveEventListener(eventNames: string, callback?: any, thisArg?: any) {
    if (isTraceEnabled()) {
      writeGlobalEventsTrace(`Remove: "${eventNames}" this:${thisArg} from "${viewName}"`);
    }
    observable.off(eventNames, callback, thisArg);
  };
}

// Add the global events to the View-class before adding it to the sub-classes.
setupGlobalEventsOnViewType(View);

for (const viewClass of [
  AbsoluteLayout,
  ActionBar,
  ActivityIndicator,
  Button,
  DatePicker,
  DockLayout,
  EditableTextBase,
  FlexboxLayout,
  Frame,
  GridLayout,
  HtmlView,
  Image,
  ListPicker,
  ListView,
  Page,
  Progress,
  Repeater,
  ScrollView,
  SearchBar,
  SegmentedBar,
  Slider,
  StackLayout,
  Switch,
  TabView,
  TextField,
  TextView,
  TimePicker,
  WebView,
  WrapLayout,
]) {
  setupGlobalEventsOnViewType(viewClass);
}
