import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptAccessibilityExt } from '@demo/shared';
import {} from '@nativescript/nativescript-accessibility-ext';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptAccessibilityExt {}
