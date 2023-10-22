import { Medicine } from "../masterdata/medicine";
import { Entity } from "../share/audit";

export interface MedOverview {
  patientId: string;
  thisMonthMeds: MedItem[];
}

export interface MedItem {
  medId: number;
  medicine: Medicine;
  count: number;
}

export interface MedHistoryItemInfo extends Entity {
  entryTime: Date;
  patientId: string;
  medicineId: number;
  medicine: Medicine;

  quantity: number;
  overrideDose: number;
  overrideUnit: string;
}

export interface MedHistoryResult {
  columns: Date[];
  data: {key: Medicine, value: MedHistoryItemInfo[][] }[];
}

export interface CreateMedDetail {
  entryTime: Date;
  medicineId: number;
  
  quantity: number;
  overrideDose: number;
  overrideUnit: string;
}