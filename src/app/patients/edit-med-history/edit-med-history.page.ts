import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { PatientInfo } from '../patient-info';
import { Medicine } from 'src/app/masterdata/medicine';
import { MedHistoryItemInfo } from '../med-history';
import { AlertController, IonContent, IonNav, ModalController, NavParams, Platform } from '@ionic/angular';
import { formatISO } from 'date-fns';
import { AuthService } from 'src/app/auth/auth.service';
import { MedHistoryService } from '../med-history.service';
import { ModalBack, addOrEdit, decimalFormat, onLeavePage } from 'src/app/utils';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-edit-med-history',
  templateUrl: './edit-med-history.page.html',
  styleUrls: ['./edit-med-history.page.scss'],
})
export class EditMedHistoryPage implements OnInit {
  @Input() patient: PatientInfo;
  @Input() medicine: Medicine;
  @Input() value: MedHistoryItemInfo;

  tmp: MedHistoryItemInfo;
  editable: boolean = true;

  maxDate: string;
  error: string;

  get width() { return this.plt.width(); }

  get decimal() {
    return decimalFormat();
  }

  override: boolean;

  @ViewChild(IonContent) content: IonContent;

  constructor(
    private plt: Platform,
    private auth: AuthService,
    private medService: MedHistoryService,
    private alertCtl: AlertController,
    private params: NavParams,
    private injector: Injector) { }

  ngOnInit() {
    // for reverse back (cancel case)
    this.tmp = Object.assign({}, this.value);
    this.tmp.medicine = this.medicine;

    const date = new Date();
    this.maxDate = formatISO(date);

    this.editable = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units.includes(this.patient.unitId);
    this.override = !!(this.tmp.overrideDose || this.tmp.overrideUnit);
  }

  getTotalAmount() {
    const dose = (this.override ? this.tmp.overrideDose : 0) || (this.medicine.dose ?? 0) || 1;
    const qty = this.tmp.quantity || 1;
    return dose * qty;
  }

  getUnit() {
    return (this.override ? this.tmp.overrideUnit : null) || this.medicine.doseUnit || 'Pcs';
  }

  async save() {
    // force and ensure patient id
    this.tmp.patientId = this.patient.id;

    if (!this.override) {
      this.tmp.overrideDose = null;
      this.tmp.overrideUnit = null;
    }

    const saveToServer$ = this.medService.updateMedDetail(this.tmp);
    await addOrEdit(this.injector, {
      addOrEditCall: saveToServer$,
      successTxt: { name: 'Med History', editMode: true},
      content: this.content,
      errorCallback: err => this.error = err,
      isModal: true,
      successCallback: data => {
        if (data) {
          this.tmp = Object.assign(this.tmp, data);
          if (this.medicine) {
            this.tmp.medicine = this.medicine;
          }
        }
        this.medService.setTmp(this.tmp);
      },
      completeCallback: () => this.error = null
    });
  }

  async delete() {
    const alert = await this.alertCtl.create({
      backdropDismiss: true,
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this med history?',
      subHeader: `${this.medicine.name}: ${this.value.quantity*(this.value.overrideDose??this.medicine.dose??1)} ${this.value.overrideUnit??this.medicine.doseUnit??'pcs'} (${formatDate(this.value.entryTime, 'MMM dd, yyyy hh:mm a', 'en-US')}) (Original Value)`,
      buttons: [
        {
          text: 'Confirm',
          handler: () => this.medService.deleteMedDetail(this.value)
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
