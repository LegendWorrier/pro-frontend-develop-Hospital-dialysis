import { Data } from "./data";

export interface Stockable extends Data {
    name: string;
    code?: string;
    pieceUnit?: string;

    barcode?: string;

    note?: string;

    image?: string;

    // ======= For FE view Only
    type?: string;
}

