import * as trace from 'tns-core-modules/trace';

export function isTraceEnabled() {
  return trace.isEnabled();
}
/**
 * Write to NativeScript's trace.
 */
export function writeTrace(message: string, type = trace.messageType.info, category = 'A11Y') {
  if (isTraceEnabled()) {
    trace.write(message, category, type);
  }
}

export function writeFontScaleTrace(message: string, type = trace.messageType.info) {
  writeTrace(message, type, 'A11Y-FontScale');
}

export function writeGlobalEventsTrace(message: string, type = trace.messageType.info) {
  writeTrace(message, type, 'A11Y-GlobalEvents');
}

export function writeErrorTrace(message) {
  writeTrace(message, trace.messageType.error);
}

export function writeWarnTrace(message) {
  writeTrace(message, trace.messageType.warn);
}
