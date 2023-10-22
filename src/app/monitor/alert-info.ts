import { Alarm } from "./alarm";

export interface AlertInfo {
  Timestamp: Date;
  Type: Alarm;

  Dismiss?: boolean;
}