import { Component } from '@angular/core';

import * as dialogs from 'ui/dialogs';

@Component({
  selector: 'my-app',
  templateUrl: 'app.component.html',
  styleUrls: [
    'app.component.css',
  ]
})
export class AppComponent {
  traits = [
    { key: 'none', label: ' Used when the element has no traits.' },
    { key: 'button', label: ' Used when the element should be treated as a button.' },
    { key: 'link', label: ' Used when the element should be treated as a link.' },
    { key: 'header', label: ' Used when an element acts as a header for a content section (e.g. the title of a navigation bar).' },
    { key: 'search', label: ' Used when the text field element should also be treated as a search field.' },
    { key: 'image', label: ' Used when the element should be treated as an image. Can be combined with button or link, for example.' },
    { key: 'selected', label: ' Used when the element is selected. For example, a selected row in a table or a selected button within a segmented control.' },
    { key: 'plays', label: ' Used when the element plays its own sound when activated.' },
    { key: 'key', label: ' Used when the element acts as a keyboard key.' },
    { key: 'text', label: ' Used when the element should be treated as static text that cannot change.' },
    { key: 'summary', label: ' Used when an element can be used to provide a quick summary of current conditions in the app when the app first launches. For example, when Weather first launches, the element with today\'s weather conditions is marked with this trait.' },
    { key: 'disabled', label: ' Used when the control is not enabled and does not respond to user input.' },
    { key: 'frequentUpdates', label: ' Used when the element frequently updates its label or value, but too often to send notifications. Allows an accessibility client to poll for changes. A stopwatch would be an example.' },
    { key: 'startsMedia', label: ' Used when activating an element starts a media session (e.g. playing a movie, recording audio) that should not be interrupted by output from an assistive technology, like VoiceOver.' },
    { key: 'adjustable', label: ' Used when an element can be "adjusted" (e.g. a slider).' },
    { key: 'allowsDirectInteraction', label: ' Used when an element allows direct touch interaction for VoiceOver users (for example, a view representing a piano keyboard).' },
    { key: 'pageTurn', label: ' Informs VoiceOver that it should scroll to the next page when it finishes reading the contents of the element.' },
  ];

  componentTypes = [
    { key: 'button', label: 'Button element' },
    { key: 'radiobutton_checked', label: 'Checked radiobutton' },
    { key: 'radiobutton_unchecked', label: 'Unchecked radiobutton' },
  ];

  tapped(e: any) {
    const el = e.object;

    dialogs.alert(`Tapped: ${el.automationText || el.text}`);
  }
}
