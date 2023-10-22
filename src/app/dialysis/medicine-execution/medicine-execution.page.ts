import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent, LoadingController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { Frequency, MedicinePrescription } from 'src/app/patients/medicine-prescription';
import { MedicinePrescriptionService } from 'src/app/patients/medicine-prescription.service';
import { PatientInfo } from 'src/app/patients/patient-info';
import { addOrEdit, presentToast } from 'src/app/utils';
import { MedicineRecord } from '../execution-record';
import { HemosheetInfo } from '../hemosheet-info';
import { RecordService } from '../record.service';

@Component({
  selector: 'app-medicine-execution',
  templateUrl: './medicine-execution.page.html',
  styleUrls: ['./medicine-execution.page.scss'],
})
export class MedicineExecutionPage implements OnInit {
  @Input() hemosheet: HemosheetInfo;
  @Input() patient: PatientInfo;


  prescriptions: MedicinePrescription[] = [];
  isLoading = true;

  selectionMap: { [key: string]: boolean } = {};

  error: string;
  @ViewChild(IonContent) content: IonContent;

  constructor(
    private medPres: MedicinePrescriptionService,
    private record: RecordService,
    private loadCtl: LoadingController,
    private injector: Injector
    ) { }

  ngOnInit() {
    this.medPres.getAllPrescriptionByPatient(this.patient).subscribe(data => {
      this.prescriptions = data
        .filter((x) => x.isActive)
        .filter((x, index, list) => list.findIndex(y => y.medicine.id === x.medicine.id) === index);
      this.prescriptions.filter(x => !x.isExpired).forEach(x => this.selectionMap[`${x.id}`] = false);
      this.isLoading = false;
    });
  }

  getFreq(item: MedicinePrescription) {
    return this.medPres.getFreq(item.frequency);
  }

  async autoList() {
    const loading = await this.loadCtl.create({
      backdropDismiss: false,
      animated: true,
      spinner: 'circles'
    });
    loading.present();

    this.medPres.getAutoList(this.patient)
    .pipe(finalize(() => loading.dismiss()))
    .subscribe(data => {
      if (data.length === 0) {
        presentToast(this.injector, {
          message: 'There is nothing to auto select, for today.',
          native: true
        });
        return;
      }

      for (const x in this.selectionMap) {
        if (Object.prototype.hasOwnProperty.call(this.selectionMap, x))
        {
          if (data.some(n => x === n)) {
            this.selectionMap[x] = true;
          }
          else if (this.prescriptions.find(n => n.id === x)?.frequency !== Frequency.PRN) {
            this.selectionMap[x] = false;
          }
        }
      }

    });
  }

  get disableConfirm(): boolean {
    for (const x in this.selectionMap) {
      if (Object.prototype.hasOwnProperty.call(this.selectionMap, x))
      {
        if (this.selectionMap[x]) {
          return false;
        }
      }
    }

    return true;
  }

  async save() {
    const createList = this.prescriptions.filter(x => this.selectionMap[`${x.id}`]);
    const callToServer$ = this.record.createNewMedicineRecords(this.hemosheet, createList);
    addOrEdit(this.injector, {
      addOrEditCall: callToServer$,
      successTxt: 'Medicine record(s) added.',
      content: this.content,
      errorCallback: (err) => {
        this.error = err;
      },
      isModal: true,
      customErrorHandling: (err) => {
        if (err instanceof HttpErrorResponse && err.status === 400 && Array.isArray(err.error)) {
          const errList = [];
          err.error.forEach(item => {
            const medName = this.prescriptions.find(x => x.id === item.prescriptionId).medicine.name;
            const errMsg = `${medName}: ${item.errorMessage}`;
            errList.push(errMsg);
          });
          const errString: string = errList.join('\n');
          this.error = errString;
          this.content.scrollToBottom();

          return true;
        }
        else {
          return false;
        }
      },
      successCallback: (data) => {
        const list = (data as MedicineRecord[]);
        for (const record of list) {
          record.prescription = this.prescriptions.find(x => x.id === record.prescriptionId);
        }
        return list;
      },
      completeCallback: () => this.error = null
    });
  }

}
