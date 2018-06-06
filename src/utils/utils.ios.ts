export * from "tns-core-modules/utils/utils";

import { writeTrace } from "./helpers";

export function isAccessibilityServiceEnabled(): boolean {
  const isEnabled = UIAccessibilityIsVoiceOverRunning();
  writeTrace(`isAccessibilityServiceEnabled().ios: isEnabled:${isEnabled}`);

  return isEnabled;
}
