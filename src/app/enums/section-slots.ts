export enum SectionSlots {
    Mon,
    Tue,
    Wed,
    Thu,
    Fri,
    Sat,
    Sun
}

export namespace SectionSlots {
    export function after(value: SectionSlots): SectionSlots {
        return (value + 1) % 7;
    }

    export function before(value: SectionSlots): SectionSlots {
        return (7 + (value - 1)) % 7;
    }
}
