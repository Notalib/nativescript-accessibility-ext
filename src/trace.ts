import * as trace from 'tns-core-modules/trace';
export namespace categories {
  export const A11Y = 'A11Y';
  export const GlobalEvents = `${A11Y}-GlobalEvents`;
  export const FontScale = `${A11Y}-FontScale`;
  export const AndroidHelper = `${A11Y}-AndroidHelper`;

  export const separator = ',';
  export const All = [A11Y, GlobalEvents, FontScale, AndroidHelper];
}

export function isTraceEnabled() {
  return trace.isEnabled();
}

/**
 * Write to NativeScript's trace.
 */
export function writeTrace(message: string, type = trace.messageType.info, category = categories.A11Y) {
  if (isTraceEnabled()) {
    trace.write(message, category, type);
  }
}

export function writeFontScaleTrace(message: string, type = trace.messageType.info) {
  writeTrace(message, type, categories.FontScale);
}

export function writeGlobalEventsTrace(message: string, type = trace.messageType.info) {
  writeTrace(message, type, categories.GlobalEvents);
}

export function writeErrorTrace(message) {
  trace.write(message, categories.A11Y, trace.messageType.error);
}

export function writeWarnTrace(message) {
  writeTrace(message, trace.messageType.warn);
}
