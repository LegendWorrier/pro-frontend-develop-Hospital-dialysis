import { GUID } from 'src/app/share/guid';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonContent, IonNav, Platform } from '@ionic/angular';
import { Medicine, UsageWays } from 'src/app/masterdata/medicine';
import { addOrEdit, decimalFormat, deepCopy } from 'src/app/utils';
import { EditMedicinePrescription, Frequency, MedicinePrescription } from '../medicine-prescription';
import { MedicinePrescriptionService } from '../medicine-prescription.service';

@Component({
  selector: 'app-edit-medicine-prescription',
  templateUrl: './edit-medicine-prescription.page.html',
  styleUrls: ['./edit-medicine-prescription.page.scss'],
})
export class EditMedicinePrescriptionPage implements OnInit {

  @Input() isModal: boolean;
  @Input() patientId: string;
  @Input() prescription: MedicinePrescription;
  @Input() medicine: Medicine;
  @Input() overrideId: GUID;
  @Input() canEdit: boolean;

  tmp: EditMedicinePrescription = new MedicinePrescription as EditMedicinePrescription;

  usageWays = Object.values(UsageWays).map(v => ({ text: v, value: v }));
  frequencies = Object.values(Frequency).map(v => ({ text: v, value: v }));

  deleted: boolean;
  editMode: boolean;

  routes: { text: string, value: any }[]; // filtered and mapped
  freqs: { text: string, value: any}[]; // mapped

  noExpire: boolean;
  override: boolean;
  otherHospital: boolean;

  error: string;
  @ViewChild(IonContent) content: IonContent;

  get width() { return this.plt.width(); }

  constructor(
    private plt: Platform,
    private nav: IonNav,
    private router: Router,
    private medPres: MedicinePrescriptionService,
    private alertCtl: AlertController,
    private injector: Injector) {
      const curNav = this.router.getCurrentNavigation();
      if (curNav?.extras?.state) {
        this.canEdit = curNav.extras.state.canEdit;
      }
    }

  ngOnInit() {
    if (this.medicine) {
      this.tmp.medicine = this.medicine;
      this.editMode = false;
    }
    else {
      this.tmp = Object.assign(new MedicinePrescription, deepCopy(this.prescription));
      if (this.tmp.id) {
        this.editMode = true;
      }
    }
    this.tmp.medicineId = this.tmp.medicine.id; // Set and ensure medicine Id

    if (!this.tmp.medicine.usageWays) {
      this.routes = this.medPres.getRouteMap();
    }
    else {
      this.routes = this.medPres.getRouteMap(this.tmp.medicine.usageWays);
    }
    this.freqs = this.medPres.getFreqMaps();
    this.deleted = !this.tmp.isActive;

    this.noExpire = (this.tmp.duration === 0);

    this.override = !!(this.tmp.overrideDose || this.tmp.overrideUnit);
  }

  get decimal() {
    return decimalFormat();
  }

  getTotalAmount() {
    return this.tmp.getTotalAmount(this.override);
  }

  getUnit() {
    return this.tmp.getUnit(this.override);
  }

  get useImmidately() {
    return this.tmp.useImmidately;
  }

  get useWhenNeeded() {
    return this.tmp.useWhenNeeded;
  }

  calculateAmountOverDuration() {
    return this.tmp.calculateAmountOverDuration(this.override);
  }


  async save() {
    // force and ensure patient id
    this.tmp.patientId = this.patientId;

    if (!this.override) {
      this.tmp.overrideDose = null;
      this.tmp.overrideUnit = null;
    }
    if (this.noExpire) {
      this.tmp.duration = 0;
    }
    else if (!this.tmp.duration) {
      this.tmp.duration = 1;
    }
    if (!this.otherHospital) {
      this.tmp.hospitalName = null;
    }
    if (!this.tmp.quantity || this.tmp.quantity < 1) {
      this.tmp.quantity = 1;
    }

    // *** calculate admin date and expire datetime on 12.00 AM always
    this.tmp.administerDate = new Date(this.tmp.administerDate);
    this.tmp.administerDate.setHours(0, 0, 0);

    let override = false;
    if (this.overrideId) {
      const alert = await this.alertCtl.create({
        backdropDismiss: false,
        header: 'Overridable',
        subHeader: 'Duplicated Medicine',
        message:
        `There is already an active prescription with this medicine,
        Do you want to override and edit that one instead?`,
        buttons: [
          { text: 'Save as new one', handler: () => { alert.dismiss(false); return false; } },
          { text: 'Override Existing', handler: () => { alert.dismiss(true); return true; } }
        ]
      });

      alert.present();
      const result = await alert.onDidDismiss();
      // override
      if (result.data) {
        override = true;
        this.tmp.id = this.overrideId;
      }
      else if (!this.editMode) {
        this.tmp.id = undefined;
      }
    }

    const callToServer$ = this.editMode || override ?
      this.medPres.editPrescription(this.tmp) :
      this.medPres.createPrescription(this.tmp);

    addOrEdit(this.injector, {
        addOrEditCall: callToServer$,
        successTxt: { editMode: this.editMode, name: 'Medicine Prescription' },
        isModal: this.isModal,
        content: this.content,
        errorCallback: (err) => {
          this.error = err;
        },
        successCallback: async (data) => {
          if (data) {
            this.tmp = Object.assign(this.tmp, data);
            if (this.medicine) {
              this.tmp.medicine = this.medicine;
            }
          }

          this.medPres.setTmp(this.tmp);
          if (!this.editMode) {
            const targetPage = await this.nav.getPrevious(await this.nav.getPrevious());
            this.nav.popTo(targetPage);
          }
        },
        stay: !this.editMode,
        completeCallback: () => this.error = null
      });
  }

}
