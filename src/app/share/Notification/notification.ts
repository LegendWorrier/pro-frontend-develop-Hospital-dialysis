import { GUID } from './../guid';
export interface Notification {
  Id: GUID;
  Title: string;
  Detail: string;
  Action: string[];
  Tags: string[];

  Type: NotiType;

  ExpireDate: Date;
  Created: Date;

  // ------- FE Only -----------

  isRead?: boolean;
  isNew?: boolean;
}

export interface NotiInfo {
  Notification: Notification;
  Languages: { [key: string]: string }
}

export enum NotiType {
  Info,
  Warning,
  Error,
  Approve,
  ActionRequired
}

export interface NotiResult {
  Data: Notification[];
  Total: number;
}