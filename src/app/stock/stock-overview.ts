import { Stockable } from "../masterdata/stockable";

export interface StockOverview<T extends Stockable> {
    itemInfo: T;
    unitId: number;
    sum: number;

    type?: 'med' | 'dialyzer' | 'equipment' | 'supply';

    // =============== FE Only =====================
    img?: string // used to store data url getting from itemInfo
}