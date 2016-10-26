class AccessibilityDelegate extends android.view.View.AccessibilityDelegate {
  constructor(protected className: string) {
    super();
  }

  public onInitializeAccessibilityEvent(host: android.view.View, event: android.view.accessibility.AccessibilityEvent) {
    super.onInitializeAccessibilityEvent(host, event);
    event.setClassName(this.className);
  }

  public onInitializeAccessibilityNodeInfo(host: android.view.View, info: android.view.accessibility.AccessibilityNodeInfo) {
    super.onInitializeAccessibilityNodeInfo(host, info);
    info.setClassName(this.className);
  }
}

class ButtonDelegate extends AccessibilityDelegate {
  constructor() {
    super(android.widget.Button.class.getName());
  }
}

class RadioButtonDelegate extends AccessibilityDelegate {
  constructor(private checked: boolean) {
    super(android.widget.RadioButton.class.getName());
  }

  public onInitializeAccessibilityEvent(host: android.view.View, event: android.view.accessibility.AccessibilityEvent) {
    super.onInitializeAccessibilityEvent(host, event);
    event.setChecked(this.checked);
  }

  public onInitializeAccessibilityNodeInfo(host: android.view.View, info: android.view.accessibility.AccessibilityNodeInfo) {
    super.onInitializeAccessibilityNodeInfo(host, info);
    info.setCheckable(true);
    info.setChecked(this.checked);
  }
}

const BUTTON_DELEGATE = new ButtonDelegate();
const RADIOBUTTON_CHECKED_DELEGATE = new RadioButtonDelegate(true);
const RADIOBUTTON_UNCHECKED_DELEGATE = new RadioButtonDelegate(false);

export class AccessibilityHelper {
  public static BUTTON = 'button';
  public static RADIOBUTTON_CHECKED = 'radiobutton_checked';
  public static RADIOBUTTON_UNCHECKED = 'radiobutton_unchecked';

  public static updateAccessibilityComponentType(view: android.view.View, componentType: string) {
    switch (componentType) {
      case AccessibilityHelper.BUTTON: {
        view.setAccessibilityDelegate(BUTTON_DELEGATE);
        break;
      }
      case AccessibilityHelper.RADIOBUTTON_CHECKED: {
        view.setAccessibilityDelegate(RADIOBUTTON_CHECKED_DELEGATE);
        break;
      }
      case AccessibilityHelper.RADIOBUTTON_UNCHECKED: {
        view.setAccessibilityDelegate(RADIOBUTTON_UNCHECKED_DELEGATE);
        break;
      }
      default: {
        view.setAccessibilityDelegate(null);
        break;
      }
    }
  }
}
