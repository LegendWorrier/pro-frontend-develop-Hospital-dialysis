import { Component, Input, OnInit, Injector, ViewChild } from '@angular/core';
import { AlertController, IonContent, IonNav, LoadingController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { AssessmentInfo } from 'src/app/dialysis/assessment';
import { TRTMappingPatient } from 'src/app/enums/trt-patient';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { PatienHistoryItem } from 'src/app/masterdata/patient-history-item';
import { ToastType, addOrEdit, deepCopy, presentToast } from 'src/app/utils';

@Component({
  selector: 'app-patient-history-detail',
  templateUrl: './patient-history-detail.page.html',
  styleUrls: ['./patient-history-detail.page.scss'],
})
export class PatientHistoryDetailPage implements OnInit {

  @Input() entry: PatienHistoryItem;
  @Input() lastOrder: number;
  @Input() canEdit: boolean;

  editMode: boolean;

  trtEnable = AppConfig.config.enableTRTMap;
  trtMaps: {t: string, v: number}[] = Object.keys(TRTMappingPatient).filter(key =>
    !isNaN(Number(TRTMappingPatient[key]))).map(x => ({ t: x, v: TRTMappingPatient[x] }));

  entryType = [
    { txt: 'Text', v: 'string' },
    { txt: 'Number', v: 'number' },
    { txt: 'Yes/No', v: 'bool' }
  ];
  optionType = [
    { txt: 'None', v: null },
    { txt: 'Choice', v: 'select' },
    { txt: 'Suggestion', v: 'suggest' }
  ]

  option: string | null;
  type: 'string' | 'number' | 'bool';
  error: string;

  get showOption() { return this.canHaveChoice && this.option; }

  get canHaveChoice() { return !this.entry.isNumber && !this.entry.isYesNo; }

  @ViewChild('content') content: IonContent;

  constructor(
    private master: MasterdataService,
    private nav: IonNav,
    private alertCtl: AlertController,
    private loadCtl: LoadingController,
    private injector: Injector) { }

  ngOnInit() {
    if (this.entry) {
      this.editMode = true;
      const original = deepCopy(this.entry);
      this.master.setTmp(original);
    }
    else {
      this.editMode = false;
      this.entry = { order: this.lastOrder + 1, id: 0, allowOther: false, isNumber: false, isYesNo: false, choices: [], trt: TRTMappingPatient.None };
    }
    
    this.initReadEntry();
  }

  initReadEntry() {
    if (this.entry.choices?.length > 0) {
      this.option = this.entry.allowOther ? 'suggest' : 'select';
    }
    else {
      this.option = null;
    }
    this.type = this.entry.isYesNo ? 'bool' : this.entry.isNumber ? 'number' : 'string';
  }

  onTypeChange() {
    switch (this.type) {
      case 'string':
        this.entry.isNumber = false;
        this.entry.isYesNo = false;
        break;
      case 'number':
        this.entry.isNumber = true;
        this.entry.isYesNo = false;
        break;
      case 'bool':
        this.entry.isNumber = false;
        this.entry.isYesNo = true;
        break;
    
      default:
        break;
    }
  }

  onOptionChange() {
    if (this.option) {
      this.entry.allowOther = (this.option === 'suggest');
      
    }
    else {
      this.entry.allowOther = false;
    }
  }

  addNewOption() {
    this.entry.choices.push({ text: null });
  }

  save() {
    
    const $call = this.editMode ?
      this.master.editPatientHistoryItem(this.entry)
      : this.master.addPatientHistoryItem(this.entry);
    addOrEdit(this.injector, {
      addOrEditCall: $call,
      successCallback: (data: AssessmentInfo) => {
        if (this.editMode) {
          this.master.setTmp(null);
        }
        else {
          this.master.setTmp(data);
        }
      },
      successTxt: {
        name: 'Assessment',
        editMode: this.editMode
      },
      errorCallback: (err) => this.error = err,
      completeCallback: () => this.error = null,
      content: this.content,
      isModal: true
    });
  }

  async delete() {
    const alert = await this.alertCtl.create({
      backdropDismiss: true,
      header: 'Confirmation',
      subHeader: 'Delete Assessment',
      message: 'Are you sure you want to delete this assessment? The assessment will be permanently deleted and cannot be restored back.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          role: 'OK',
          handler: async () => {
            const loading = await this.loadCtl.create({backdropDismiss: false});
            loading.present();
            this.master.deletePatientHistoryItem(this.entry)
              .pipe(finalize(() => loading.dismiss()))
              .subscribe({
                next: () => {
                  this.master.setTmp({id: 0});
                  presentToast(this.injector, {
                    message: 'The patient history entry has been permanently deleted.',
                    header: 'Deleted',
                    type: ToastType.alert
                  });
                  this.nav.pop();
                },
                error: (err) => {
                  console.log(err);
                  presentToast(this.injector, {
                    message: 'Cannot delete the patient history entry due to some technical issue. Please try again.',
                    header: 'Failed',
                    native: true
                  });
                }
              });
          }
        }
      ]
    });
    alert.present();
  }

}
