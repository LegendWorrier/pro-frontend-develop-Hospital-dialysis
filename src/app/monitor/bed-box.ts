import { PatientBasicInfo } from './patient-basic-info';
import { GUID } from '../share/guid';
export interface BedBox {
  MacAddress: string;
  Name: string;
  UnitId?: number;

  X: number;
  Y: number;

  PreferedPatient: string; // patientId

  PatientId: string;

  Online: boolean;
  Sending: boolean;

  IsRegistered: boolean;

  // temporary store
  Patient?: PatientBasicInfo;
  HemosheetId?: GUID;
}