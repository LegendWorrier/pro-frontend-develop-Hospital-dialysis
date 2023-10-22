import { compareDesc } from 'date-fns';
import { EditAdmissionPage } from './../edit-admission/edit-admission.page';
import { GUID } from './../../share/guid';
import { deepCopy, pushOrModal } from 'src/app/utils';
import { Platform, IonNav, AlertController } from '@ionic/angular';
import { AdmissionService } from './../admission.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Patient } from '../patient';
import { AdmissionInfo } from '../admission';
import { Observable } from 'rxjs';
import { PageView } from 'src/app/share/page-view';
import { ModalService } from 'src/app/share/service/modal.service';

@Component({
  selector: 'app-admission-list',
  templateUrl: './admission-list.page.html',
  styleUrls: ['./admission-list.page.scss'],
})
export class AdmissionListPage implements OnInit {

  @Input() patient: Patient;
  @Input() admit: AdmissionInfo;
  @Output() admitChange = new EventEmitter<AdmissionInfo>();

  admissionList: AdmissionInfo[] = [];

  updating: AdmissionInfo;
  firstLoad = true;
  
  constructor(
    private admission: AdmissionService,
    private alertCtl: AlertController,
    private modal: ModalService,
    private nav: IonNav,
    private plt: Platform) { }

  get width() { return this.plt.width(); }


  ngOnInit() {
    
  }
  
  get loadAdmission$(): (page: number, limit: number, where: string) => Observable<PageView<AdmissionInfo>> {
    return (page, limit) => this.admission.getAllForPatient(this.patient.id, page, limit);
  }

  async newAdmission() {
    const result = await pushOrModal(EditAdmissionPage, {isModal: true, patientId: this.patient.id }, this.modal);
    if (result) {
      this.onAddNew(result);
    }
  }

  // Update
  async onSelect([item]: [AdmissionInfo]) {
    this.updating = item;
    const result = await pushOrModal(EditAdmissionPage, {
      isModal: true,
      patientId: this.patient.id,
      admit: item,
      canEdit: true,
    }, this.modal);
    if (result) {
      Object.assign(item, result);
      if (this.admit && item.id === this.admit.id) {
        this.admit = item;
        this.admitChange.emit(this.admit);
      }
    }
  }

  async onOptionSelect([item, i]: [AdmissionInfo, number]) {
    switch (i) {
      case 0: // Copy
        await this.copy(item);
        break;
      case 1: // Delete
        this.delete(item);
        break;
    }
  }

  async copy(item: AdmissionInfo) {
    const copied = deepCopy(item) as AdmissionInfo;
    copied.id = null; // force to add new
    
    const result = await pushOrModal(EditAdmissionPage, {
      isModal: true,
      patientId: this.patient.id,
      canEdit: true,
      admit: copied
    }, this.modal);
    if (result) {
      this.onAddNew(result);
    }
  }

  onAddNew(data: AdmissionInfo) {
    this.admissionList.unshift(data);
    this.admissionList.sort((x, y) => compareDesc(new Date(x.admit), new Date(y.admit)));
    if (this.admissionList.indexOf(data) === 0) {
      this.admit = data;
      this.admitChange.emit(this.admit);
    }
  }

  async delete(item: AdmissionInfo) {
    const alert = await this.alertCtl.create({
      header: 'Confirmation',
      subHeader: 'This cannot be undone!',
      message: `Are you sure you want to delete this admission?
                <br>
                <br>
                (Existing AN will be blank on report)`,
      buttons: [
        {text: 'Cancel'},
        {text: 'Confirm', role: 'OK', handler: () => {
          this.admission.deleteAdmit(item.id as GUID).subscribe({
            next: () => {
              this.admissionList.splice(this.admissionList.indexOf(item), 1);
              if (item.id === this.admit?.id) {
                console.log('remove')
                this.admit = null;
                this.admitChange.emit(this.admit);
              }
            }
          });
        }}
      ]
    });
    alert.present();
  }

}
