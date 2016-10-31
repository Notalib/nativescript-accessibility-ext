class ButtonDelegate extends android.view.View.AccessibilityDelegate {
  private className = android.widget.Button.class.getName();
  constructor() {
    super();

    return global.__native(this);
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

class RadioButtonDelegate extends android.view.View.AccessibilityDelegate {
  private className = android.widget.RadioButton.class.getName();
  constructor(private checked: boolean) {
    super();

    return global.__native(this);
  }

  public onInitializeAccessibilityEvent(host: android.view.View, event: android.view.accessibility.AccessibilityEvent) {
    super.onInitializeAccessibilityEvent(host, event);
    event.setClassName(this.className);
    event.setChecked(this.checked);
  }

  public onInitializeAccessibilityNodeInfo(host: android.view.View, info: android.view.accessibility.AccessibilityNodeInfo) {
    super.onInitializeAccessibilityNodeInfo(host, info);
    info.setClassName(this.className);
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
