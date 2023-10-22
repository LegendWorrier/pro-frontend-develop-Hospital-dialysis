import { newGuid } from 'src/app/share/guid';
import { ShiftData, ShiftSlot } from './../../shifts/shift-slot';
import { LabService } from './../../lab-exam/lab.service';
import { PatientInfo } from 'src/app/patients/patient-info';
import { addDays, differenceInYears, format, lastDayOfMonth, startOfDay, startOfMonth } from 'date-fns';
import { saveAs } from 'file-saver';
import { Injectable } from '@angular/core';
import * as Excel from 'exceljs';
import { TableResult } from 'src/app/reports/table-result';
import { RowSpanComputer } from 'src/app/reports/stat/row-span-computer';
import { LabResult } from 'src/app/lab-exam/lab-result';
import { Gender } from 'src/app/enums/gender';
import { MedHistoryResult } from 'src/app/patients/med-history';
import { UserShiftResult } from 'src/app/shifts/user-shift';
import { ShiftInfo } from 'src/app/shifts/shift-info';
import { convertStartTimeToDate, endTimeAsDate } from 'src/app/schedule/schedule-utils';
import { Unit } from 'src/app/masterdata/unit';
import { deepCopy, getName } from 'src/app/utils';
import { User } from 'src/app/auth/user';
import { ScheduleView } from 'src/app/schedule/schedule-view';



const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(private lab: LabService) { }

  private rowSpanComputer = new RowSpanComputer();

  public async exportTableAsExcelFile(
    title: string,
    params: {[name: string]: any},
    table: TableResult<any>,
    durationMode: string,
    infoTexts: any[][],
    excelFileName: string): Promise<void> {

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('export');

    const columns = table.columns;
    const formatStr = durationMode === 'Y' ? 'yyyy' : (durationMode === 'M' ? 'MMM yyyy' : 'yyyy-MM-dd');
    const headerRow = worksheet.addRow([...columns.map(x => format(new Date(x.data), formatStr))]);
    /* headerRow.eachCell((c) => {
      c.numFmt = durationMode === 'Y' ? 'yyyy' : (durationMode === 'M' ? 'MMM yyyy' : 'yyyy-MM-dd');
    }); */
    worksheet.addRows(table.rows.map(x => x.data.map(y => y || '-')));
    worksheet.getColumn(worksheet.columns.length + 1).values = ['Total', ...table.rows.map(x => x.data.reduce((a, b) => a + b, 0))];
    worksheet.columns.forEach(c => c.alignment = { horizontal: 'center' });
    worksheet.spliceColumns(1, 0, [(params.name || 'Name') + ' / Date', ...table.rows.map(x => x.title) ]);

    const mergeInfo = [];
    const hasInfo = table.info?.length > 0;
    if (hasInfo) {
      const rowSpan = this.rowSpanComputer.compute(table.rows, [ 'infoRef' ]);
      worksheet.spliceColumns(1, 0, [(params.infoName || 'Info'), ...table.rows.map((row, i) =>
        rowSpan[0][i].span ? (params.infoKey ? table.info[row.infoRef][params.infoKey] : table.info[row.infoRef].title) : undefined)]);
      rowSpan[0].forEach((v) => {
        if (v.span) {
          mergeInfo.push(v.span);
        }
      });
    }

    this.adjustColumnWidth(worksheet);
    worksheet.eachRow(r => r.font = { name: 'Calibri' });

    this.writeTitleAndInfo(worksheet, title, infoTexts);

    let startIndex = infoTexts.length + 4;
    mergeInfo.forEach((v, i) => {
      worksheet.mergeCells(startIndex, 1, startIndex + v - 1, 1);
      startIndex = startIndex + v;
    });

    this.downloadFile(workbook, excelFileName);

  }

  exportSchedule(schedule: ScheduleView, patientMap: { [id: string]: PatientInfo }, units: Unit[]) {
    const mergeInfo: number[] = [];

    const header = { title: 'Schedule : ' + units.find(u => u.id === schedule.unitId).name, infoTexts: [] };
    const columns = new DefaultTableColumns();
    columns.preColumns = ['Round\\Day'];
    columns.columns = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    columns.expandAllColumnToMax = true;
    const workbook = this.createExcel_Table(header, columns, schedule.sections,
      (data, rownum) => {
        const sectionLabel = format(convertStartTimeToDate(data.section.startTime), 'hh:mm a') + ' - ' + format(endTimeAsDate(data.section), 'hh:mm a');
        const slotPatients = data.slots.map(x => x.patientList);
        const rows = this.computeMultiValueToRows(slotPatients, { cols: [ sectionLabel ] }, (data) => {
          return { cellData: patientMap[data.patientId].name };
        });
        mergeInfo.push(rows.length);

        return rows;
      });
    const worksheet = workbook.getWorksheet(1);
    let startIndex = 4;
    mergeInfo.forEach((v, i) => {
      worksheet.mergeCells(startIndex, 1, startIndex + v - 1, 1);
      worksheet.getCell(startIndex, 1).alignment = {
        vertical: 'middle'
      };
      startIndex = startIndex + v;
    });

    // format border
    worksheet.getCell(1,1).border = { top: {style: 'thick'}, left: {style: 'thick'}, bottom: {style: 'thick'}, right: {style: 'thick'} };
    for (let i = 0; i < 8; i++) {
      let startRow = 3;
      for (let ii = 0; ii < mergeInfo.length + 1; ii++) {
        const h = ii === 0 ? 1 : mergeInfo[ii-1];
        for (let n = 0; n < h; n++) {
          const cell = worksheet.getCell(startRow + n, i+1);
          const horizontalStyle = ii === 0 ? 'medium' : 'thin';
          const top = ii === 0 ? 'medium' : (n === 0) ? 'thin' : null;
          const bottom = ii === 0 ? 'medium' : (n === h-1) ? 'thin' : null;
          cell.border = {
            top: {style: top},
            left: {style: horizontalStyle},
            bottom: {style: bottom},
            right: {style: horizontalStyle}
          };
        }
        startRow += h;
      }
    }
    
    this.downloadFile(workbook, 'Schedule_' + units.find(u => u.id === schedule.unitId).name);
  }

  exportShiftSheet(sheet: UserShiftResult, shiftInfo: ShiftInfo[], units: Unit[], nurses: User[]) {
    console.log(sheet);
    const month = startOfDay(new Date(sheet.month));

    const offLimitColor = 'F07070';
    const reservedColor = 'FFE101';
    const suspendColor = 'D9D9D9';

    const numberOfDays = lastDayOfMonth(month).getDate();
    const firstDay = startOfDay(startOfMonth(month));
    const column = Array.from(Array(numberOfDays), (_, i) => addDays(firstDay, i));
    const reserveList = [];
    const offLimitList = [];
    const suspendList = [];
    const shiftList = [];

    const header = {
      title: 'Shift Sheet - ' + format(month, 'MMMM yyyy'),
      infoTexts: [ [ null, 'Rounds'], ...shiftInfo.map(x => 
        [ null, units.find(u => u.id === x.unitId).name, ...x.sections.map((s, i) => 
          (i + 1) + '. ' + format(convertStartTimeToDate(s.startTime), 'HH:mm')) 
        ]),
        [null, 'Label', 'Off-Limit', 'Reserved', 'Suspended']
      ]
    };
    const columns = { columns: column, preColumns:[ 'Employee ID' ], postColumns:[], format: 'dd   EEEEEE' }

    const workbook = this.createExcel_DateColumnTable(header, columns, sheet.users,
      (data, rownum) => {
        const user = nurses.find(x => x.id === data.userId);
        const name = getName(user);
        const row = [ name, user.employeeId ];
        if (data.suspended) {
          suspendList.push(rownum);
          return { row , comments: [] } as TableRow;
        }
        if (data.shiftSlots.length === 0) {
          return { row , comments: [] } as TableRow;
        }

        const shiftMap = new Map<ShiftData, number>([
          [ShiftData.Section1, 1],
          [ShiftData.Section2, 2],
          [ShiftData.Section3, 3],
          [ShiftData.Section4, 4],
          [ShiftData.Section5, 5],
          [ShiftData.Section6, 6]
        ]);

        const rowData = deepCopy(data.shiftSlots) as ShiftSlot[];
        
        for (let i = 0; i < numberOfDays; i++) {
          if (new Date(rowData[0].date).getDate() === (i+1)) {
            const slot = rowData.shift();
            let data = '';
            if (slot.unitId) {
              const values = ShiftData.toValues(slot.shiftData);
              let start = 0;
              let end = 0;
              const addRange = (start: number, end: number) => {
                if (start === end) {
                  data += '|' + start;
                }
                else {
                  data += '|' + start + '-' + end;
                }
              };
              for (const shift of values) {
                const v = shiftMap.get(shift);
                if (!start) {
                  start = v;
                  end = v;
                  continue;
                }
                if (v === end + 1) {
                  end = v;
                }
                else {
                  addRange(start, end);
                  start = 0;
                }
              }
              if (start) {
                addRange(start, end);
              }
              if (values.length > 1) {
                data = data.substring(1);
              }
              else {
                data += '|';
              }

              const unit = shiftInfo.find(x => x.unitId === slot.unitId);
              shiftList.push([rownum, i, unit]);
            }
            else if (ShiftData.hasFlag(slot.shiftData, ShiftData.OffLimit)) {
              offLimitList.push([rownum, i]);
            }
            else if (ShiftData.hasFlag(slot.shiftData, ShiftData.Reserved)) {
              reserveList.push([rownum, i]);
            }

            row.push(data);

            if (rowData.length === 0) {
              break;
            }
            
          }
          else {
            row.push(null);
          }
        }

        return { row , comments: [] } as TableRow;
      }
    );

    
    const worksheet = workbook.getWorksheet(1);
    // format color
    shiftInfo.forEach((unitShift, i) => {
      worksheet.getCell(3+i, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: unitShift.color } };
    });
    
    let startRow = 6 + shiftInfo.length;
    const startCol = 3
    const offLimitCell = worksheet.getCell(`C${3+shiftInfo.length}`);
    offLimitCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: offLimitColor } };
    offLimitList.forEach(item => {
      worksheet.getCell(item[0] + startRow, item[1] + startCol).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: offLimitColor } };
    });
    const reserveCell = worksheet.getCell(`D${3+shiftInfo.length}`);
    reserveCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: reservedColor } };
    reserveList.forEach(item => {
      console.log(item);
      worksheet.getCell(item[0] + startRow, item[1] + startCol).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: reservedColor } };
    });
    const suspendCell = worksheet.getCell(`E${3+shiftInfo.length}`);
    suspendCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: suspendColor } };
    suspendList.forEach(item => {
      worksheet.getRow(item + startRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: suspendColor } };
    });

    // format border
    worksheet.getCell(1,1).border = { top: {style: 'thick'}, left: {style: 'thick'}, bottom: {style: 'thick'}, right: {style: 'thick'} };
    startRow = 5 + shiftInfo.length;
    for (let i = 0; i < numberOfDays + 2; i++) {
      for (let ii = 0; ii < sheet.users.length + 1; ii++) {
        const cell = worksheet.getCell(ii+startRow, i+1);
        cell.border = {
          top: {style: ii === 0 ? 'thick' : 'thin'},
          left: {style: i === 0 ? 'thick' : 'thin'},
          bottom: {style: ii === sheet.users.length ? 'thick' : 'thin'},
          right: {style: i === numberOfDays + 1 ? 'thick' : 'thin'}
        };
        
      }
    }
    // alignment
    for (let i = 0; i < 2; i++) {
      for (let ii = 0; ii < sheet.users.length + 1; ii++) { 
        worksheet.getCell(ii+startRow, i+1).alignment = { vertical: 'middle' };
      }  
    }
    shiftList.forEach(shift => {
      // format cell
      const cell = worksheet.getCell(shift[0] + 9, shift[1] + 3);
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: shift[2].color } };
    });

    this.downloadFile(workbook, 'Shift_' + format(month, 'MMMM_yyyy'));
  }

  exportMedHistory(patient: PatientInfo, medHistoryResult: MedHistoryResult) {
    const workbook = this.createExcel_DateColumnTable(
      { patient: patient, title: 'Medicine History' },
      { columns: medHistoryResult.columns, preColumns: [], postColumns: [] },
      medHistoryResult.data,
      (data) => {
        const name = data.key.name;
        const output = this.computeMultiValueToRows(data.value, { cols: [name] }, (value) => {
          const unit = value.overrideUnit ?? value.medicine.doseUnit ?? 'pcs';
          const dose = value.overrideDose ?? value.medicine.dose ?? 1;
          return { cellData: `${value.quantity * dose} ${unit}` };
        });
        return output;
      }
    );

    this.downloadFile(workbook, patient.name + '_medHistory');
  }

  exportLabAsExcelFile(patient: PatientInfo, labResult: LabResult) {

    const workbook = this.createExcel_DateColumnTable(
      { patient: patient, title: 'Lab Exam' },
      { columns: labResult.columns, preColumns: [ 'Reference' ], postColumns: [] },
      labResult.data,
      (data) => {
        const name = data.key.name;
        const limits = this.lab.getLimits(data.key, patient);
        const referenceValue = `${limits.lower || '?'} - ${limits.upper || '?'}`;

        const output = this.computeMultiValueToRows(data.value, { cols: [ name, referenceValue ] }, (value) => {
          const limit = this.checkLimit(limits, value.labValue);
          let comment: string;
          if (limit !== 0) {
            comment = limit > 0 ? `Higher than expected: ${referenceValue}` : `Lower than expected: ${referenceValue}`;
          }
          return { cellData: value.labValue, comment };
        });

        return output;
      });

    this.downloadFile(workbook, patient.name + '_labExam');
  }

  private checkLimit(limits: { lower: number; upper: number; }, value: number): number {
    if (!value) {
      return 0;
    }

    if (limits.lower && value < limits.lower) {
      return -1;
    }
    if (limits.upper && value > limits.upper) {
      return 1;
    }

    return 0;
  }

  private writePatientHeader(patient: PatientInfo, title: string, worksheet: Excel.Worksheet) {
    const infoTexts = [
      ['Patient\'s Name:', patient.name],
      ['Patient\'s Age:', differenceInYears(new Date, new Date(patient.birthDate))],
      ['Patient\'s Gender:', patient.gender === Gender.Male ? 'Male' : patient.gender === Gender.Female ? 'Female' : 'Unknown']
    ];
    this.writeTitleAndInfo(worksheet, title, infoTexts);
  }

  private writeTitleAndInfo(worksheet: Excel.Worksheet, title: string, infoTexts: any[][]) {
    const row = worksheet.insertRow(1, [title]);
    worksheet.mergeCells(1, 1, 1, 6);

    const infos = worksheet.insertRows(2, infoTexts);
    for (let rowindex = 0; rowindex < infoTexts.length; rowindex++) {
      const element = infoTexts[rowindex];
      if (element.length === 2) {
        worksheet.mergeCells(rowindex + 2, 2, rowindex + 2, 6);
        worksheet.getCell(rowindex + 2, 2).alignment = { horizontal: 'left' };
      }
    }
    worksheet.insertRow(infoTexts.length + 2, null);

    const titleCell = worksheet.getCell(1, 1);
    titleCell.font = { name: 'Calibri', bold: true, size: 12 };
    titleCell.alignment = { horizontal: 'center' };
  }

  private adjustColumnWidth(worksheet: Excel.Worksheet, columnAllMaxW = false) {
    let maxW = 0;
    worksheet.columns.forEach((column, ci) => {
      const lengths = column.values.map((v, ri) => {
        const cell = worksheet.getCell(ri, ci + 1);
        if (cell.isMerged) {
          return 0;
        }
        if (cell.numFmt && cell.type === Excel.ValueType.Date) {
          const formatted = format(cell.value as Date, cell.numFmt);
          // console.log(formatted, formatted.length);
          return formatted.length + 1;
        }
        return cell.text.length || v.toString().length;
      });
      const maxLength = Math.max(8, ...lengths.filter(v => typeof v === 'number'));
      column.width = maxLength;
      if (maxLength > maxW)
      {
        maxW = maxLength;
      } 
      // console.log('width: ', column.width);
    });
    if (columnAllMaxW) {
      worksheet.columns.forEach(c => c.width = maxW);
    }
  }

  private async downloadFile(workbook: Excel.Workbook, filename: string) {

    const buffer = await workbook.xlsx.writeBuffer({ useStyles: true });
    const blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });

    saveAs(blob, filename + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  // ===================== Common Utils ===========================
  private executeExcelHeader(header: ExcelHeader, worksheet: Excel.Worksheet) {
    if (header.patient) {
      this.writePatientHeader(header.patient, header.title, worksheet);
    }
    else
    {
      this.writeTitleAndInfo(worksheet, header.title, header.infoTexts);
    }
  }

  private createExcel_Table<T, TCol>(
    header: ExcelHeader,
    columns: TableColumns<TCol>,
    dataBody: T[],
    computeRow: (data: T, i: number) => TableRow[] | TableRow
  ) {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('export');

    this.executeExcelHeader(header, worksheet);

    const headerRow = worksheet.addRow([...columns.preColumns, ...columns.columns.map(x => columns.convert(x)), ...columns.postColumns]);

    let i = 0;
    for (const row of dataBody) {
      const rowOutput = computeRow(row, i);
      if (Array.isArray(rowOutput)) {
        rowOutput.forEach(row => {
          this.addDataRow(worksheet, row);
        });
      }
      else {
        this.addDataRow(worksheet, rowOutput);
      }
      i++;
    }

    this.adjustColumnWidth(worksheet, columns.expandAllColumnToMax ?? false);
    worksheet.eachRow((r, i) => {
      if (i === 1) {
        return;
      }
      r.font = { name: 'Calibri' };
    });

    return workbook;
  }

  private createExcel_DateColumnTable<T>(
    header: ExcelHeader,
    columns: DateTableColumns,
    dataBody: T[],
    computeRow: (data: T, i: number) => TableRow[] | TableRow) {

    const formatStr = columns?.format ?? 'yyyy-MM-dd';
    columns.convert = (x) => format(new Date(x), formatStr);
    columns.preColumns = columns.preColumns ?? [];
    columns.preColumns.unshift('Name/Date');

    return this.createExcel_Table(header, columns, dataBody, computeRow);
  }

  private computeMultiValueToRows<T>(data: T[][], pre: { cols: any[], comments?: string[] },  computeCell: (data: T) => { cellData: any, comment?: string }) {
    if (!pre) {
      pre = { cols: [] };
    }
    const result = [] as TableRow[];

    const internalCompute = (list: T[]) => {
      const value = list.shift();
      if (value) {
        const row = computeCell(value);
        rowOutput.row.push(row.cellData);
        rowOutput.comments.push(row.comment);
      }
      else {
        rowOutput.row.push(null);
        rowOutput.comments.push(null);
      }

      if (list.length > 0) {
        rowOutput.hasMultipleValue = true;
      }
    }

    const valueList = [] as T[][];
    let rowOutput = {
      row: [...pre.cols],
      hasMultipleValue: false,
      comments: pre.comments ?? new Array(pre.cols.length).fill(null) // 'comments' must have the same length with 'cols' or else this is error
    } as TableRowMultiValue;
    data.forEach((v, i) => {
      valueList[i] = [...v];
      internalCompute(valueList[i]);
    });
    result.push(rowOutput);
    while (rowOutput.hasMultipleValue) {
      rowOutput = {
        row: new Array(pre.cols.length).fill(null),
        hasMultipleValue: false,
        comments : new Array(pre.cols.length).fill(null) as string[]
      } as TableRow;
      
      valueList.forEach((list) => {
        internalCompute(list);
      });
      result.push(rowOutput);
    }

    return result;
  }

  private addDataRow(worksheet: Excel.Worksheet, rowOutput: TableRow ) {
    const dataRow = worksheet.addRow(rowOutput.row);
    rowOutput.comments.forEach((c, i) => {
      if (c) {
        dataRow.getCell(i + 1).note = c;
      }
    });
  }


}

export interface ExcelHeader {
  title: string;
  infoTexts?: any[][];
  patient?: PatientInfo;
}

export interface TableColumns<T> {
  preColumns: any[];
  columns: T[];
  postColumns: any[];

  expandAllColumnToMax?: boolean;

  convert?: (data: T) => string
}

export class DefaultTableColumns implements TableColumns<string> {
  preColumns: any[] = [];
  columns: string[] = [];
  postColumns: any[] = [];
  convert?: (data: string) => string = (x) => x;
  expandAllColumnToMax?: boolean = false;
}

export interface DateTableColumns extends TableColumns<Date> {
  format?: string,
}

// Main data block
export interface TableRow {
  row: any[];
  comments: string[]; // need to include slot(s) for all the name and extra pre/post columns (match with the row yourself)
  
}

export interface TableRowMultiValue extends TableRow {
  hasMultipleValue?: boolean;
}
