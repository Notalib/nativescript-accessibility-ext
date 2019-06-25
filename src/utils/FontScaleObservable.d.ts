import { Observable } from 'tns-core-modules/data/observable';

export declare class FontScaleObservable extends Observable {
    public static readonly FONT_SCALE: 'fontScale';
    public static readonly VALID_FONT_SCALES: number[];
    public readonly fontScale: number;
}
