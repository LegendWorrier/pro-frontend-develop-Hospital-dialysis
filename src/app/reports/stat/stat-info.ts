export interface StatInfo {
  text?: string;
  count?: number;
  avg?: number;
  max?: number;
  min?: number;
  totalCount?: number;
  percent?: number;
}

export interface StatRowInfo {
  type: StatType;
  info?: any;
}

export enum StatType {
  Avg,
  Count,
  Max,
  Min
}