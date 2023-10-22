import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController, IonNav, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { OptionListComponent } from 'src/app/share/components/options-item/option-list.component';
import { Frequency, MedicinePrescription } from '../medicine-prescription';
import { Patient } from '../patient';
import { Permissions } from 'src/app/enums/Permissions';
import { MedicinePrescriptionService } from '../medicine-prescription.service';
import { EditMedicinePrescriptionPage } from '../edit-medicine-prescription/edit-medicine-prescription.page';
import { SelectMedicinePage } from '../select-medicine/select-medicine.page';
import { UsageWays } from 'src/app/masterdata/medicine';

@Component({
  selector: 'app-medicine-prescription-list',
  templateUrl: './medicine-prescription-list.page.html',
  styleUrls: ['./medicine-prescription-list.page.scss'],
})
export class MedicinePrescriptionListPage implements OnInit {
  @Input() patient: Patient;

  prescriptionList: MedicinePrescription[] = [];
  showDeleted: boolean;
  canEdit: boolean;

  updating: MedicinePrescription;
  dataList: MedicinePrescription[] = [];
  activeList: MedicinePrescription[] = [];

  constructor(
    private modal: ModalController,
    private alertCtl: AlertController,
    private medPresService: MedicinePrescriptionService,
    private auth: AuthService,
    private nav: IonNav,
    private plt: Platform) { }

  ngOnInit() {
    this.initList();
    this.canEdit = this.auth.currentUser.checkPermissionLevel(Permissions.HeadNurseUp);
  }

  initList() {
    this.medPresService.getAllPrescriptionByPatient(this.patient)
      .subscribe(data => {
        this.prescriptionList = data;
        this.updateList();
      });
  }

  get width() {
    return this.plt.width();
  }

  updateList() {
    if (this.prescriptionList.length === 0) {
      return;
    }
    this.dataList = this.showDeleted ? this.prescriptionList : this.prescriptionList.filter(x => x.isActive);
    this.activeList = this.prescriptionList.filter(x => x.isActive);

    OptionListComponent.ResetOptionsVisible(this.dataList);
  }

  close() {
    this.modal.dismiss();
  }

  ionViewWillEnter() {

    const data = this.medPresService.getTmp();
    if (data) {
      // handle override case
      const existing = this.prescriptionList.find(x => x.id === data.id);
      if (this.updating || existing) {
        Object.assign(this.updating ?? existing, data);
        this.updating = null;
      }
      else {
        this.prescriptionList.unshift(data);
      }
    }
    this.updating = null;

    this.updateList();

  }

  // Add
  newPrescription() {
    this.nav.push(SelectMedicinePage, { patient: this.patient, presList: this.dataList });
  }

  // Update
  async onSelect([item]: [MedicinePrescription]) {
    this.updating = item;
    this.nav.push(EditMedicinePrescriptionPage, {
      isModal: true,
      patientId: this.patient.id,
      prescription: item,
      canEdit: this.canEdit && this.medPresService.checkCanEdit(item)
    });
  }

  onOptionSelect([item, i]: [MedicinePrescription, number]) {
    switch (i) {
      case 0: // Copy
        this.copy(item);
        break;
      case 1: // Delete
        this.delete(item);
        break;
    }
  }

  get itemClasses() {
    return (item: MedicinePrescription, i: number): string[] => {
      const classes = [];
      if (item.isActive && !this.isInUse(item)) {
        classes.push('unused');
      }

      return classes;
    };
  }

  copy(item: MedicinePrescription) {
    const overridable = this.prescriptionList.find(x => x.medicine.id === item.medicine.id && x.isActive && !x.isHistory);
    const copied = Object.assign(new MedicinePrescription, item);
    copied.id = null; // force to add new
    copied.isActive = true; // reset delete state (if deleted)
    this.nav.push(EditMedicinePrescriptionPage, {
      isModal: true,
      patientId: this.patient.id,
      canEdit: true,
      prescription: copied,
      overrideId: overridable?.id
    });
  }

  async delete(item: MedicinePrescription) {
    const alert = await this.alertCtl.create({
      header: 'Confirmation',
      subHeader: 'This cannot be undone!',
      message: `Are you sure you want to delete this? It will be hidden from the list and history.
                <br>
                <br>
                (It can still be accessed by enable "Show Deleted" button.)`,
      buttons: [
        {text: 'Cancel'},
        {text: 'Confirm', role: 'OK', handler: () => {
          this.medPresService.deletePrescription(item).subscribe({
            next: () => {
              item.isActive = false;
              this.updateList();
            }
          });
        }}
      ]
    });
    alert.present();
  }

  getFreq(freq: Frequency) {
    return this.medPresService.getFreq(freq);
  }

  getRoute(route: UsageWays) {
    return this.medPresService.getRoute(route);
  }

  getAmount(item: MedicinePrescription) {
    const amount = item.getTotalAmount();
    const unit = item.getUnit();

    return `${amount} ${unit}`;
  }

  getExpire(item: MedicinePrescription) {
    const expire = item.getExpireDate();
    if (!expire) {
      return null;
    }
    return expire;
  }

  isInUse(item: MedicinePrescription) {
    const noLater = this.activeList.find(x => x.medicine.id === item.medicine.id && x.created > item.created) == null;

    return item.isActive && noLater;
  }

}
