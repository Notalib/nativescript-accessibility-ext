import { isTraceEnabled, writeErrorTrace, writeTrace } from './helpers';

export * from 'tns-core-modules/utils/utils';

export function isAccessibilityServiceEnabled(): boolean {
  const cls = `isAccessibilityServiceEnabled<ios>()`;
  if (typeof UIAccessibilityIsVoiceOverRunning !== 'function') {
    writeErrorTrace(`${cls} - UIAccessibilityIsVoiceOverRunning() - is not a function`);
    return false;
  }

  const isEnabled = !!UIAccessibilityIsVoiceOverRunning();
  if (isTraceEnabled()) {
    writeTrace(`${cls}: isEnabled:${isEnabled}`);
  }
  return isEnabled;
}
