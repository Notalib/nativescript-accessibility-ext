import { Trace } from '@nativescript/core';
export namespace categories {
  export const A11Y = 'A11Y';
  export const GlobalEvents = `${A11Y}-GlobalEvents`;
  export const FontScale = `${A11Y}-FontScale`;
  export const AndroidHelper = `${A11Y}-AndroidHelper`;

  export const separator = ',';
  export const All = [A11Y, GlobalEvents, FontScale, AndroidHelper];
}

export function isTraceEnabled() {
  return Trace.isEnabled();
}

/**
 * Write to NativeScript's trace.
 */
export function writeTrace(message: string, type = Trace.messageType.info, category = categories.A11Y) {
  if (isTraceEnabled()) {
    Trace.write(message, category, type);
  }
}

export function writeFontScaleTrace(message: string, type = Trace.messageType.info) {
  writeTrace(message, type, categories.FontScale);
}

export function writeGlobalEventsTrace(message: string, type = Trace.messageType.info) {
  writeTrace(message, type, categories.GlobalEvents);
}

export function writeErrorTrace(message) {
  Trace.write(message, categories.A11Y, Trace.messageType.error);
}

export function writeWarnTrace(message) {
  writeTrace(message, Trace.messageType.warn);
}
