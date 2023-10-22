import { Stockable } from './stockable';

export interface Dialyzer extends Stockable {
    brandName: string;
    flux: DialyzerType;
    membrane: MembraneType;
    surfaceArea?: number;
}

export enum MembraneType {
    Unsubstituted,
    Substituted,
    Synthetic
}

export enum DialyzerType {
    LowFlux,
    HighFlux,
    DoubleHighFlux
}
