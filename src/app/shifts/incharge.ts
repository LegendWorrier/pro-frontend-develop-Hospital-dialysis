import { GUID } from 'src/app/share/guid';

export interface Incharge {
    unitId: number; // Unit Id
    date: Date;
    userId?: GUID;
    sections: InchargeSection[];
}

export interface InchargeSection {
    sectionId: number;
    userId: GUID;
}
