import { Data } from "../masterdata/data";
import { Entity } from "../share/audit";
import { GUID } from '../share/guid';

export interface AdmissionInfo extends Entity {
  an: string;
  admit: Date;
  discharged: Date;

  underlying: Data[]; // โรคประจำตัว
  chiefComplaint: string; // อาการสำคัญ (ที่มา admit)
  diagnosis: string;

  room: string;
  telNo: string;

  statusDc: string; // status ตอน discharged
  transferTo: string;
}

export class EditAdmission implements AdmissionInfo {
  an: string;
  admit: Date;
  discharged: Date;
  underlying: Data[] = [];
  chiefComplaint: string;
  diagnosis: string;
  room: string;
  telNo: string;
  statusDc: string;
  transferTo: string;
  id: number | GUID;
  createdBy?: GUID;
  updatedBy?: GUID;
  created?: Date;
  updated?: Date;
  
  patientId: string;

  underlyingList: number[] = [];
}