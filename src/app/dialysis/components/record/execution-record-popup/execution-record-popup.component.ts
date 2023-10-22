import { PopupSelectDatetimeComponent } from './../../../../share/components/popup-select-datetime/popup-select-datetime.component';
import { RecordService } from 'src/app/dialysis/record.service';
import { Component, EventEmitter, Input, OnInit, Output, Injector } from '@angular/core';
import { IonNav, PopoverController } from '@ionic/angular';
import { ExecutionRecord, FlushRecordInstance } from 'src/app/dialysis/execution-record';
import { HemosheetInfo } from 'src/app/dialysis/hemosheet-info';
import { MedicineExecutionPage } from 'src/app/dialysis/medicine-execution/medicine-execution.page';
import { PatientInfo } from 'src/app/patients/patient-info';
import { ModalService } from 'src/app/share/service/modal.service';
import { pushOrModal, addOrEdit } from 'src/app/utils';

@Component({
  selector: 'app-execution-record-popup',
  templateUrl: './execution-record-popup.component.html',
  styleUrls: ['./execution-record-popup.component.scss'],
})
export class ExecutionRecordPopupComponent implements OnInit {
  @Input() hemosheet: HemosheetInfo;
  @Input() patient: PatientInfo;

  @Input() nav: IonNav;

  @Output() onUpdate: EventEmitter<ExecutionRecord[]> = new EventEmitter<ExecutionRecord[]>();

  constructor(
    private modal: ModalService,
    private popupCtl: PopoverController,
    private record: RecordService,
    private injector: Injector) { }

  ngOnInit() {}

  medicineRecord() {
    const params = { hemosheet: this.hemosheet, patient: this.patient };
    pushOrModal(MedicineExecutionPage, params, this.modal)
    .then(data => {
      if (data) {
        this.onUpdate.emit(data);
      }
    });

    this.popupCtl.dismiss(null, null, 'execute-popup');
  }

  async flushRecord() {
    // create
    const flushRecord = new FlushRecordInstance();
    flushRecord.timestamp = new Date();
    flushRecord.hemodialysisId = this.hemosheet.id;
    await this.saveRecord(flushRecord);
    this.onUpdate.emit([flushRecord]);

    this.popupCtl.dismiss(null, null, 'execute-popup');
  }

  async saveRecord(record: ExecutionRecord) {
    const callToServer$ = this.record.createNewExecutionRecord(this.hemosheet, record);
    addOrEdit(this.injector, {
      addOrEditCall: callToServer$,
      successTxt: 'Medicine record(s) added.',
      isModal: true,
      stay: true,
      successCallback: (data) => {
        Object.assign(record, (data as ExecutionRecord));
      }
    });
  }
}
