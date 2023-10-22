import { KidneyState } from './../../../enums/kidney-state';
import { MedHistoryItemInfo, MedOverview } from './../../med-history';
import { EditAdmissionPage } from './../../edit-admission/edit-admission.page';
import { ModalService } from './../../../share/service/modal.service';
import { AppConfig } from './../../../app.config';
import { AuthService } from './../../../auth/auth.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { Data } from 'src/app/masterdata/data';
import { formatBloodType } from 'src/app/utils';
import { Patient } from '../../patient';
import { PatientService } from '../../patient.service';
import { AdmissionInfo } from '../../admission';
import { MedHistoryPage } from '../../med-history/med-history.page';
import { AddMedHistoryPage } from '../../add-med-history/add-med-history.page';
import { isAfter, startOfMonth } from 'date-fns';

@Component({
  selector: 'hemo-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss'],
})
export class BasicInfoComponent implements OnInit {
  @Input() patient: Patient;
  @Input() admit: AdmissionInfo;
  @Output() admitChange = new EventEmitter<AdmissionInfo>();
  @Input() doctorName: string;
  @Input() medicineList: Data[];

  @Input() medOverview: MedOverview; // Med History
  @Output() medOverviewChange = new EventEmitter<MedOverview>();

  canEdit: boolean;
  useHN: boolean;

  KidneyState = KidneyState;

  constructor(
    private nav: NavController,
    private activatedRoute: ActivatedRoute,
    private patientService: PatientService,
    private auth: AuthService,
    private modal: ModalService,
    private plt: Platform) { }

  ngOnInit() {
    this.canEdit = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units.includes(this.patient.unitId);
    this.useHN = AppConfig.config.patient?.useHnOnly;
  }

  edit() {
    this.patientService.setTmp(this.patient);
    this.nav.navigateForward(['update'], { relativeTo: this.activatedRoute });
  }

  get width() { return this.plt.width(); }

  getMedicine(id: number): string {
    return this.medicineList?.find(x => x.id === id).name || null;
  }

  getBloodType() {
    return formatBloodType(this.patient.bloodType);
  }

  async newAdmit() {
    const newAdmit = await this.modal.openModal(EditAdmissionPage, {
      isModal: true,
      patientId: this.patient.id,
      fromMain: true
    });

    const result = await newAdmit.onWillDismiss();
    if (result.data) {
      this.admit = result.data;
      this.admitChange.emit(this.admit);
    }
  }

  async medHistory() {
    await this.modal.openModal(MedHistoryPage, {
      patient: this.patient,
      medOverview: this.medOverview,
      medOverviewChange: this.medOverviewChange
    });

  }

  async addMedHistory() {
    const addMed = await this.modal.openModal(AddMedHistoryPage, {
      patient: this.patient
    });

    const result = await addMed.onWillDismiss();
    if (result.data) {
      const newMed = result.data as MedHistoryItemInfo[];
      const entryTime = new Date(newMed[0].entryTime);
      // is this month
      if (isAfter(entryTime, startOfMonth(new Date()))) {
        for (let index = 0; index < newMed.length; index++) {
          const item = newMed[index];
          const targetMed = this.medOverview.thisMonthMeds.find(x => x.medId === item.medicineId);
          if (!targetMed) {
            this.medOverview.thisMonthMeds.push({ medId: item.medicineId, medicine: item.medicine, count: 1 });
          }
          else {
            targetMed.count += 1;
          }
        }
        this.medOverviewChange.emit(this.medOverview);
      }
      
    }
  }

  history() {
    this.patientService.setTmp(this.patient);
    this.nav.navigateForward(['history'], { relativeTo: this.activatedRoute });
  }
}
