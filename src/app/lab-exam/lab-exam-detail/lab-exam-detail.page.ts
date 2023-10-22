import { LabService } from './../lab.service';
import { Platform, IonContent, IonNav, ModalController, NavParams, AlertController } from '@ionic/angular';
import { LabExamInfo } from './../lab-exam';
import { LabItemInfo } from 'src/app/masterdata/labItem';
import { PatientInfo } from 'src/app/patients/patient-info';
import { Component, Input, OnInit, Injector, ViewChild } from '@angular/core';
import { formatISO } from 'date-fns';
import { addOrEdit, ModalBack, onLeavePage } from 'src/app/utils';
import { Gender } from 'src/app/enums/gender';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-lab-exam-detail',
  templateUrl: './lab-exam-detail.page.html',
  styleUrls: ['./lab-exam-detail.page.scss'],
})
export class LabExamDetailPage implements OnInit {
  @Input() patient: PatientInfo;
  @Input() item: LabItemInfo;
  @Input() value: LabExamInfo;

  @Input() isModal: boolean;

  tmp: LabExamInfo;
  editable: boolean = true;

  maxDate: string;
  error: string;

  get width() { return this.plt.width(); }
  male = Gender.Male;
  female = Gender.Female;

  isYesNo = false;

  @ViewChild(IonContent) content: IonContent;

  constructor(private plt: Platform, private injector: Injector, private labService: LabService, private params: NavParams, private alertCtl: AlertController) { }

  ngOnInit() {
    // for reverse back (cancel case)
    this.tmp = Object.assign({}, this.value);

    const date = new Date();
    this.maxDate = formatISO(date);

    this.editable = !this.item.isCalculated;

    this.isYesNo = this.item.isYesNo;
  }

  getLimits(): string {
    let limits = this.labService.getLimits(this.item, this.patient);
    if (!limits.lower && !limits.upper) {
      return 'Unknown';
    }
    return `${(limits.lower === undefined ? 'Unknown' : limits.lower)} ~ ${(limits.upper === undefined ? 'Unknown' : limits.upper)}`
  }

  async save() {
    const saveToServer$ = this.labService.updateLabExam(this.tmp);
    await addOrEdit(this.injector, {
      addOrEditCall: saveToServer$,
      successTxt: { name: 'Lab Exam', editMode: true},
      content: this.content,
      errorCallback: err => this.error = err,
      isModal: this.isModal,
      successCallback: data => {
        this.labService.setTmp(data);
        Object.assign(this.value, data);
      },
      completeCallback: () => this.error = null
    });
  }

  async delete() {
    const alert = await this.alertCtl.create({
      backdropDismiss: true,
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this lab record?',
      subHeader: `${this.item.name}: ${this.value.labValue} (${formatDate(this.value.entryTime, 'MMM dd, yyyy hh:mm a', 'en-US')}) (Original Value)`,
      buttons: [
        {
          text: 'Confirm',
          handler: () => this.labService.deleteLabExam(this.value)
            .subscribe({
              next: () => {
                const nav = this.injector.get(IonNav);
                const modalCtl = this.injector.get(ModalController);
                ModalBack(nav, this.params, modalCtl, true);
              }
            }),
            role: 'OK'
        },
        {
          text: 'Cancel'
        }
      ]
    });

    alert.present();
  }

  ionViewWillLeave() {
    onLeavePage(null, this.params);
  }
}
