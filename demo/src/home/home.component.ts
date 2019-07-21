import { Component } from '@angular/core';
import { AccessibilityFocusEventData } from 'tns-core-modules/ui/page';
import { LoadEventData } from 'tns-core-modules/ui/web-view/web-view';
import { alert } from 'tns-core-modules/ui/dialogs';

export interface ListItem {
  id: number;
  name: string;
  role: string;
}
@Component({
  moduleId: module.id,
  selector: 'nota-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
})
export class HomeComponent {
  public readonly source: ListItem[] = [
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
  ];

  public onLoaded(event: LoadEventData) {
    const cls = `onLoaded`;

    for (const [key, value] of Object.entries(event)) {
      console.log(`${cls} ${key}=${value}`);
    }
  }

  public onItemLoading(event) {
    const cls = `onItemLoading`;

    for (const [key, value] of Object.entries(event)) {
      console.log(`${cls} ${key}=${value}`);
    }
  }

  public onItemTap(event) {
    const cls = `onItemTap`;

    for (const [key, value] of Object.entries(event)) {
      console.log(`${cls} ${key}=${value}`);
    }
  }

  public onAccessibilityFocus(event: AccessibilityFocusEventData, index?: number) {
    const cls = `onAccessibilityFocus: index=${index}`;

    for (const [key, value] of Object.entries(event)) {
      console.log(`${cls} ${key}=${value}`);
    }
  }

  public itemTap(item: ListItem) {
    alert({
      title: item.name,
      message: item.role,
      okButtonText: 'Ok',
    });
  }
}
