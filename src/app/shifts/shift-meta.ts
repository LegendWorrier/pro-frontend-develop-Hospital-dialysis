export interface ShiftMeta {
    id?: number;
    month: Date;
    unitId: number;
    sectionCount: number;

    scheduleMeta: ScheduleMeta;
}

export interface ScheduleMeta {
    unitName: string;
    section1?: number;
    section2?: number;
    section3?: number;
    section4?: number;
    section5?: number;
    section6?: number;
}
