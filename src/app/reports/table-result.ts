export interface TableResult<T> {
  columns: Column[];
  rows: DataRow<T>[];
  info: any[];
}

export interface Column {
  title: string;
  data: any;
}

export interface DataRow<T> {
  title: string;
  data: T[];
  infoRef?: number;
}
