import { GUID } from 'src/app/share/guid';
import { compareAsc } from 'date-fns';
import { Medicine, UsageWays } from '../masterdata/medicine';
import { Audit } from '../share/audit';

export interface MedicinePrescriptionInfo extends Audit {
    id: GUID;

    patientId: string;
    medicine: Medicine;

    quantity: number;
    route: UsageWays;
    frequency: Frequency;
    administerDate: Date;
    duration: number;
    hospitalName: string;

    overrideDose: number;
    overrideUnit: string;

    note: string;

    isActive: boolean;
    // ==== FE Only =======
    isHistory: boolean;
}

export enum Frequency {
    /**
     * Once a day
     */
    QD, // Once a day
    /**
     * Once every night
     */
    QN, // Once every night
    /**
     * Two times a day
     */
    BID, // Two times a day
    /**
     * Three times a day
     */
    TID, // Three times a day
    /**
     * Four times a day
     */
    QID, // Four times a day
    /**
     * Once a week
     */
    QW = -7, // Once a week
    /**
     * Two times a week
     */
    BIW = -6, // Two times a week
    /**
     * Three times a week
     */
    TIW = -5, // Three times a week
    /**
     * Four times a week
     */
    QIW = -4, // Four times a week
    /**
     * Once every other day
     */
    QOD = -2, // Once every other day
    /**
     * Once every 2 weeks
     */
    Q2W = -14, // Once every 2 weeks
    /**
     * Once every 4 weeks
     */
    Q4W = -28, // Once every 4 weeks
    /**
     * Use when needed
     */
    PRN = 99, // Use when needed
    /**
     * Use immediately
     */
    ST = -99 // Use immediately
}

export class MedicinePrescription implements MedicinePrescriptionInfo {
    createdBy: GUID;
    updatedBy: GUID;
    created: Date;
    updated: Date;

    id: GUID;
    patientId: string;
    medicine: Medicine;
    quantity: number;
    route: UsageWays;
    frequency: Frequency;
    administerDate: Date;
    duration: number;
    hospitalName: string;
    overrideDose: number;
    overrideUnit: string;
    note: string;

    isActive = true;
    isHistory: boolean;

    getTotalAmount(override = true) {
        const dose = (override ? this.overrideDose : 0) || (this.medicine.dose ?? 0) || 1;
        const qty = this.quantity || 1;
        return dose * qty;
    }

    getUnit(override = true) {
        return (override ? this.overrideUnit : null) || this.medicine.pieceUnit || 'Pcs';
    }

    getExpireDate() {
        if (this.noExpire) {
            return null;
        }
        const duration = this.duration;
        const expireDate = new Date(this.administerDate);
        expireDate.setDate(expireDate.getDate() + duration);

        return expireDate;
    }

    get useImmidately() {
        return this.frequency === Frequency.ST;
    }

    get useWhenNeeded() {
        return this.frequency === Frequency.PRN;
    }

    get noExpire() {
        return !this.duration;
    }

    get isExpired() {
        return !this.noExpire && compareAsc(this.getExpireDate(), new Date()) <= 0;
    }

    calculateAmountOverDuration(override = true) {
        const eachDayAmount = this.getTotalAmount(override);
        const duration = this.duration || 1;
        let freq = this.frequency as number;

        let rep = 1;
        const dayOfWeek = new Date().getDay();
        const remainingWeekDays = 7 - dayOfWeek;
        if (freq >= 0) {
            freq = Math.max(1, freq);
            rep = duration * freq;
        }
        else if (freq >= -2) {
            rep = duration / 2;
        }
        else if (freq >= -7) {
            const repPerWeek = freq + 8;
            rep = Math.max((duration - remainingWeekDays), 0) / 7 * repPerWeek;
            rep += Math.min(repPerWeek, remainingWeekDays, duration);
        }
        else {
            rep = ((duration - remainingWeekDays) / 14 + 1);
        }

        return Math.ceil(rep) * eachDayAmount;
    }
}

export interface EditMedicinePrescription extends MedicinePrescription {
    medicineId: number;
}
