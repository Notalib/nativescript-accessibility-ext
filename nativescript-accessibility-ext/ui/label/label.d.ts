import { Label } from 'tns-core-modules/ui/label';
declare module 'tns-core-modules/ui/label' {
  interface Label {
    /**
     * iOS: Scale font according to platform settings
     */
    accessibilityAdjustsFontSize?: boolean;
  }
}
