import { ScrollingModule } from '@angular/cdk/scrolling';
import { PopupSelectDatetimeModule } from './../../../share/components/popup-select-datetime/popup-select-datetime.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { RecordComponent } from './record.component';
import { MatTableModule } from '@angular/material/table';
import { DialysisRecordEditPageModule } from '../../dialysis-record-edit/dialysis-record-edit.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';
import { NurseRecordEditPageModule } from '../../nurse-record-edit/nurse-record-edit.module';
import { ExecutionRecordPopupComponent } from './execution-record-popup/execution-record-popup.component';
import { MedicineExecutionPageModule } from '../../medicine-execution/medicine-execution.module';
import { MedicineRecordViewPageModule } from '../../medicine-record-view/medicine-record-view.module';
import { ExecutePromtPopupModule } from '../execute-promt-popup/execute-promt-popup.module';
import { DoctorRecordEditPageModule } from '../../doctor-record-edit/doctor-record-edit.module';
import { AppPipeModule } from "../../../pipes/app.pipe.module";
import { ProgressNoteEditPageModule } from '../../progress-note-edit/progress-note-edit.module';


@NgModule({
    declarations: [RecordComponent, ExecutionRecordPopupComponent],
    exports: [RecordComponent],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MatTableModule,
        ScrollingModule,
        DialysisRecordEditPageModule,
        NurseRecordEditPageModule,
        ProgressNoteEditPageModule,
        DoctorRecordEditPageModule,
        AuditNameModule,
        MedicineExecutionPageModule,
        MedicineRecordViewPageModule,
        ExecutePromtPopupModule,
        PopupSelectDatetimeModule,
        AppPipeModule
    ]
})
export class RecordModule {}
