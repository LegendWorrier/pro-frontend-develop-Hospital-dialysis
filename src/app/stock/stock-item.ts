import { Stockable } from "../masterdata/stockable";
import { Audit } from "../share/audit";
import { GUID } from "../share/guid";
import { StockType } from "./stock-type";

export interface StockItem<T extends Stockable> extends StockItemBase {
    itemInfo?: T;
}

export interface StockItemInfo extends StockItemBase {
    id: GUID;

    type?: 'med' | 'dialyzer' | 'equipment' | 'supply';
}

export interface StockItemBase extends Audit {
    unitId: number;
    itemId: number;
    entryDate: Date | string;
    quantity: number;
    isCredit: boolean;
    pricePerPiece?: number;
    stockType: StockType;

    sum?: number;
}

export interface StockItemWithType extends StockItemBase {
    id: GUID;
    itemInfo: Stockable;

    stockableType: string;
}