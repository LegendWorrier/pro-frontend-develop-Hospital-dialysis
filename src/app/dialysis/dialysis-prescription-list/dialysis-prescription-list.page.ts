import { GUID } from './../../share/guid';
import { firstValueFrom } from 'rxjs';
import { DialysisModeName } from './../dialysis-mode';
import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { AlertController, IonNav, ModalController, Platform, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { Permissions } from 'src/app/enums/Permissions';
import { DialysisPrescriptionEditPage } from 'src/app/dialysis/dialysis-prescription-edit/dialysis-prescription-edit.page';
import { Patient } from 'src/app/patients/patient';
import { OptionListComponent } from 'src/app/share/components/options-item/option-list.component';
import { DialysisPrescription } from '../dialysis-prescription';
import { HemoDialysisService } from '../hemo-dialysis.service';
import { HemosheetInfo } from '../hemosheet-info';
import { CosignRequestPopupComponent } from '../components/cosign-request-popup/cosign-request-popup.component';
import { addOrEdit } from 'src/app/utils';
import { RequestService } from 'src/app/share/service/request.service';

@Component({
  selector: 'app-dialysis-prescription-list',
  templateUrl: './dialysis-prescription-list.page.html',
  styleUrls: [ './dialysis-prescription-list.page.scss' ]
})
export class DialysisPrescriptionListPage implements OnInit {
  @Input() patient: Patient;
  @Input() hemosheet: HemosheetInfo;
  @Output() hemosheetChange = new EventEmitter<HemosheetInfo>();
  prescriptionList: DialysisPrescription[] = [];
  showDeleted: boolean;
  canEdit: boolean;

  updating: DialysisPrescription;
  dataList: DialysisPrescription[] = [];
  activeLongTermList: DialysisPrescription[] = [];

  mode = DialysisModeName;

  myId: GUID;

  constructor(
    private modal: ModalController,
    private alertCtl: AlertController,
    private hemoService: HemoDialysisService,
    private request: RequestService,
    private auth: AuthService,
    private nav: IonNav,
    private plt: Platform,
    private popupCtl: PopoverController,
    private injector: Injector) { }

  async ngOnInit() {
    this.initList();
    const setting = await firstValueFrom(this.hemoService.getSetting());
    this.canEdit = !setting.rules.dialysisPrescriptionRequireHeadNurse || this.auth.currentUser.checkPermissionLevel(Permissions.HeadNurseUp);
    this.myId = this.auth.currentUser.id;
  }

  initList() {
    this.hemoService.getDialysisPrescriptionList(this.patient.id)
      .subscribe(data => {
        this.prescriptionList = data.map(x => Object.assign(new DialysisPrescription, x));
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
    this.activeLongTermList = this.prescriptionList.filter(x => x.isActive && !x.temporary);

    OptionListComponent.ResetOptionsVisible(this.dataList);
  }

  get itemClasses() {
    return (item: DialysisPrescription, i: number): string[] => {
      const classes = [];
      if (item.isActive && this.isUnused(item, i)) {
        classes.push('unused');
      }

      return classes;
    };
  }

  isUnused(item: DialysisPrescription, i: number) {
    return !item.isHistory &&
    (this.activeLongTermList.indexOf(item) > 0 ||
    (item.temporary && this.activeLongTermList.length > 0 && this.dataList.indexOf(this.activeLongTermList[0]) < i));
  }

  close() {
    this.modal.dismiss();
  }

  ionViewWillEnter() {

    const data = this.hemoService.getTmpPrescription();
    if (data) {
      // handle override
      const overrideExisting = this.prescriptionList.find(x => x.id === data.id);
      if (this.updating || overrideExisting) {
        this.updating = this.updating ?? overrideExisting;
        const currentDialysisNurse = this.updating.dialysisNurse;
        Object.assign(this.updating, data);
        this.updating.dialysisNurse = currentDialysisNurse;
        this.updating = null;

        // Update the outer page
        if (this.hemosheet?.dialysisPrescription) {
          this.hemosheet.dialysisPrescription = this.prescriptionList.find(x => x.id === this.hemosheet.dialysisPrescription.id);
          this.hemosheetChange.emit(this.hemosheet);
        }
      }
      else {
        this.prescriptionList.unshift(data);
      }
    }
    // always reset updating to prevent bug
    this.updating = null;

    this.updateList();

  }

  // Add
  newPrescription() {
    // overridable
    const overrideId = this.dataList.find(x => x.isActive && !x.isHistory)?.id;
    this.nav.push(DialysisPrescriptionEditPage, { isModal: true, patient: this.patient, canEdit: true, overrideId });
  }

  // Update
  async onSelect([item]: [DialysisPrescription]) {
    this.updating = item;
    this.nav.push(DialysisPrescriptionEditPage, {
      isModal: true,
      patient: this.patient,
      prescription: item,
      canEdit: this.canEdit && this.hemoService.checkCanEdit(item)
    });
  }

  onOptionSelect([item, i]: [DialysisPrescription, number]) {
    switch (i) {
      case 0: // Copy
        this.copy(item);
        break;
      case 1: // Delete
        this.delete(item);
        break;
    }
  }

  copy(item: DialysisPrescription) {
    // overridable
    const overrideId = this.dataList.find(x => x.isActive && !x.isHistory)?.id;
    const copied = Object.assign(new DialysisPrescription, item);
    copied.patientId = null; // force to add new
    copied.isActive = true; // reset delete state (if deleted)
    this.nav.push(DialysisPrescriptionEditPage, {
      isModal: true,
      patient: this.patient,
      canEdit: true,
      prescription: copied,
      overrideId
    });
  }

  async delete(item: DialysisPrescription) {
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
          this.hemoService.deleteDialysisPrescription(item).subscribe({
            next: () => {
              item.isActive = false;
              if (this.hemosheet && this.hemosheet.dialysisPrescription?.id === item.id) {
                this.hemosheet.dialysisPrescription = null;
                this.hemosheetChange.emit(this.hemosheet);
              }
              this.updateList();
            }
          });
        }}
      ]
    });
    alert.present();
  }

  async sign(item: DialysisPrescription) {
    const call$ = this.hemoService.assingSelfPrescriptionNurse(item.id);
    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: 'Signed successfully',
      stay: true,
      isModal: true,
      successCallback: (data) => {
        item.dialysisNurse = data;
      }
    });
  }

  async requestSign(item: DialysisPrescription) {
    const call$ = (id, userId, password) => this.hemoService.updatePrescriptionNurse(id, userId, password);
    const requestCall$ = (id, userId) => this.request.requestNursePrescription(id, userId);
    const popup = await this.popupCtl.create({
      component: CosignRequestPopupComponent,
      componentProps: { label: 'Executor Nurse', resource: item, unitId: this.patient.unitId, setCosignCall: call$, requestCosignCall: requestCall$ },
      backdropDismiss: true,
      showBackdrop: true
    });
    popup.present();
    const result = await popup.onWillDismiss();
    if (result.role === 'OK') {
      item.dialysisNurse = result.data;
    }

  }

}
