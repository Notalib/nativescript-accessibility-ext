import { LoadEventData, ObservableArray } from '@nativescript/core';
import type { AccessibilityFocusEventData } from '@nativescript/core/ui/core/view';
import {} from '@nota/nativescript-accessibility-ext';
import { DemoSharedBase } from '../utils';

export interface ListItem {
  id: number;
  name: string;
  role: string;
}

export class DemoSharedNativescriptAccessibilityExt extends DemoSharedBase {
  readonly source = new ObservableArray<ListItem>([
    { id: 1, name: 'Ter Stegen', role: 'Goalkeeper' },
    { id: 3, name: 'Piqué', role: 'Defender' },
    { id: 4, name: 'I. Rakitic', role: 'Midfielder' },
    { id: 5, name: 'Sergio', role: 'Midfielder' },
    { id: 6, name: 'Denis Suárez', role: 'Midfielder' },
    { id: 7, name: 'Arda', role: 'Midfielder' },
    { id: 8, name: 'A. Iniesta', role: 'Midfielder' },
    { id: 9, name: 'Suárez', role: 'Forward' },
    { id: 10, name: 'Messi', role: 'Forward' },
    { id: 11, name: 'Neymar', role: 'Forward' },
    { id: 12, name: 'Rafinha', role: 'Midfielder' },
    { id: 13, name: 'Cillessen', role: 'Goalkeeper' },
    { id: 14, name: 'Mascherano', role: 'Defender' },
    { id: 17, name: 'Paco Alcácer', role: 'Forward' },
    { id: 18, name: 'Jordi Alba', role: 'Defender' },
    { id: 19, name: 'Digne', role: 'Defender' },
    { id: 20, name: 'Sergi Roberto', role: 'Midfielder' },
    { id: 21, name: 'André Gomes', role: 'Midfielder' },
    { id: 22, name: 'Aleix Vidal', role: 'Midfielder' },
    { id: 23, name: 'Umtiti', role: 'Defender' },
    { id: 24, name: 'Mathieu', role: 'Defender' },
    { id: 25, name: 'Masip', role: 'Goalkeeper' },
  ]);

  onLoaded(event: LoadEventData) {
    const cls = `onLoaded`;

    for (const [key, value] of Object.entries(event)) {
      console.log(`${cls} ${key}=${value}`);
    }
  }

  onItemLoading(event) {
    const cls = `onItemLoading`;

    for (const [key, value] of Object.entries(event)) {
      console.log(`${cls} ${key}=${value}`);
    }
  }

  onItemTap(event) {
    const cls = `onItemTap`;

    for (const [key, value] of Object.entries(event)) {
      console.log(`${cls} ${key}=${value}`);
    }
  }

  onAccessibilityFocus(event: AccessibilityFocusEventData, index?: number) {
    const cls = `onAccessibilityFocus: index=${index}`;

    for (const [key, value] of Object.entries(event)) {
      console.log(`${cls} ${key}=${value}`);
    }
  }

  itemTap(item: ListItem) {
    alert({
      title: item.name,
      message: item.role,
      okButtonText: 'Ok',
    });
  }
}
