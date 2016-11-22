const BUTTON_CLASS_NAME = android.widget.Button.class.getName();

const ButtonDelegate = (<any>android.view.View.AccessibilityDelegate).extend({
  onInitializeAccessibilityEvent(host: android.view.View, event: android.view.accessibility.AccessibilityEvent) {
    this.super.onInitializeAccessibilityEvent(host, event);
    event.setClassName(BUTTON_CLASS_NAME);
  },

  onInitializeAccessibilityNodeInfo(host: android.view.View, info: android.view.accessibility.AccessibilityNodeInfo) {
    this.super.onInitializeAccessibilityNodeInfo(host, info);
    info.setClassName(BUTTON_CLASS_NAME);
  },
});

const makeRadioButtonDelegateClass = (checked: boolean) => {
  const RADIOBUTTON_CLASS_NAME = android.widget.RadioButton.class.getName();

  return (<any>android.view.View.AccessibilityDelegate).extend({
    onInitializeAccessibilityEvent(host: android.view.View, event: android.view.accessibility.AccessibilityEvent) {
      this.super.onInitializeAccessibilityEvent(host, event);
      event.setClassName(RADIOBUTTON_CLASS_NAME);
      event.setChecked(checked);
    },

    onInitializeAccessibilityNodeInfo(host: android.view.View, info: android.view.accessibility.AccessibilityNodeInfo) {
      this.super.onInitializeAccessibilityNodeInfo(host, info);
      info.setClassName(RADIOBUTTON_CLASS_NAME);
      info.setCheckable(true);
      info.setChecked(checked);
    }
  });
};

const RadioButtonUncheckedDelegate = makeRadioButtonDelegateClass(false);
const RadioButtonCheckedDelegate = makeRadioButtonDelegateClass(true);

let BUTTON_DELEGATE: any;
let RADIOBUTTON_CHECKED_DELEGATE: any;
let RADIOBUTTON_UNCHECKED_DELEGATE: any;

export class AccessibilityHelper {
  public static BUTTON = 'button';
  public static RADIOBUTTON_CHECKED = 'radiobutton_checked';
  public static RADIOBUTTON_UNCHECKED = 'radiobutton_unchecked';

  private static get BUTTON_DELEGATE() {
    if (!BUTTON_DELEGATE) {
      BUTTON_DELEGATE = new ButtonDelegate();
    }

    return BUTTON_DELEGATE;
  }

  private static get RADIOBUTTON_CHECKED_DELEGATE() {
    if (!RADIOBUTTON_CHECKED_DELEGATE) {
      RADIOBUTTON_CHECKED_DELEGATE = new RadioButtonCheckedDelegate();
    }

    return RADIOBUTTON_CHECKED_DELEGATE;
  }

  private static get RADIOBUTTON_UNCHECKED_DELEGATE() {
    if (!RADIOBUTTON_UNCHECKED_DELEGATE) {
      RADIOBUTTON_UNCHECKED_DELEGATE = new RadioButtonUncheckedDelegate();
    }

    return RADIOBUTTON_UNCHECKED_DELEGATE;
  }

  public static updateAccessibilityComponentType(view: android.view.View, componentType: string) {
    switch (componentType) {
      case AccessibilityHelper.BUTTON: {
        view.setAccessibilityDelegate(AccessibilityHelper.BUTTON_DELEGATE);
        break;
      }
      case AccessibilityHelper.RADIOBUTTON_CHECKED: {
        view.setAccessibilityDelegate(AccessibilityHelper.RADIOBUTTON_CHECKED_DELEGATE);
        break;
      }
      case AccessibilityHelper.RADIOBUTTON_UNCHECKED: {
        view.setAccessibilityDelegate(AccessibilityHelper.RADIOBUTTON_UNCHECKED_DELEGATE);
        break;
      }
      default: {
        view.setAccessibilityDelegate(null);
        break;
      }
    }
  }
}
