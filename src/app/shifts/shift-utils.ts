import { ShiftData, ShiftSlot } from "./shift-slot";

export function isReserved(slot: ShiftSlot) {
    return ShiftData.hasFlag(slot.shiftData, ShiftData.Reserved);
}

export function isOfflimit(slot: ShiftSlot) {
    return ShiftData.hasFlag(slot.shiftData, ShiftData.OffLimit);
}

export function isOtherUnit(slot: ShiftSlot) {
    return !this.units.includes(slot.unitId);
}