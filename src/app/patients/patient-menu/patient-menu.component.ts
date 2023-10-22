import { AdmissionListPage } from './../admission-list/admission-list.page';
import { LabPatientPage } from './../../lab-exam/lab-patient/lab-patient.page';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonRouterOutlet, PopoverController, NavController } from '@ionic/angular';
import { AvShuntViewPage } from 'src/app/dialysis/av-shunt-view/av-shunt-view.page';
import { DialysisPrescriptionListPage } from 'src/app/dialysis/dialysis-prescription-list/dialysis-prescription-list.page';
import { HemosheetInfo } from 'src/app/dialysis/hemosheet-info';
import { HemosheetListPage } from 'src/app/dialysis/hemosheet-list/hemosheet-list.page';
import { ModalService } from 'src/app/share/service/modal.service';
import { MedicinePrescriptionListPage } from '../medicine-prescription-list/medicine-prescription-list.page';
import { Patient } from '../patient';
import { AdmissionInfo } from '../admission';
import { MedHistoryPage } from '../med-history/med-history.page';
import { MedOverview } from '../med-history';
import { DialysisSummaryListPage } from '../dialysis-summary-list/dialysis-summary-list.page';

@Component({
  selector: 'app-patient-menu',
  templateUrl: './patient-menu.component.html',
  styleUrls: ['./patient-menu.component.scss'],
})
export class PatientMenuComponent implements OnInit {
  @Input() patient: Patient;
  @Input() hemosheet: HemosheetInfo;
  @Output() hemosheetChange = new EventEmitter<HemosheetInfo>();
  @Output() onCalculated = new EventEmitter<[number, number]>();

  @Input() admit: AdmissionInfo;
  @Output() admitChange = new EventEmitter<AdmissionInfo>();

  @Input() medOverview: MedOverview;
  @Output() medOverviewChange = new EventEmitter<MedOverview>();

  @Input() outlet: IonRouterOutlet;

  constructor(private modal: ModalService, private nav: NavController, private popover: PopoverController) { }

  ngOnInit() {

  }

  async openDialysisSummary() {
    this.modal.openModal(DialysisSummaryListPage, {
      patient: this.patient,
    });
    this.popover.dismiss();
  }

  async openHemosheetPage() {
    this.modal.openModal(HemosheetListPage, {
      patient: this.patient,
      hemosheet: this.hemosheet,
      hemosheetChange: this.hemosheetChange,
      onCalculated: this.onCalculated
    });
    this.popover.dismiss();
  }

  async openAVShuntPage() {
    this.modal.openModal(AvShuntViewPage, {
      patient: this.patient
    });
    this.popover.dismiss();
  }

  async openDialysisPrescriptionPage() {
    this.modal.openModal(DialysisPrescriptionListPage, {
      patient: this.patient,
      hemosheet: this.hemosheet,
      hemosheetChange: this.hemosheetChange
    });
    this.popover.dismiss();
  }

  async openMedicinePrescriptionPage() {
    this.modal.openModal(MedicinePrescriptionListPage, {
      patient: this.patient
    });
    this.popover.dismiss();
  }

  async openAlbum() {
    // todo

    this.popover.dismiss();
  }

  async openAdmissionPage() {
    this.modal.openModal(AdmissionListPage, {
      patient: this.patient,
      admit: this.admit,
      admitChange: this.admitChange
    });

    this.popover.dismiss();
  }

  async openMedHistory() {
    this.modal.openModal(MedHistoryPage, {
      patient: this.patient,
      medOverview: this.medOverview,
      medOverviewChange: this.medOverviewChange
    });
    this.popover.dismiss();
  }

  async gotoLab() {
    this.modal.openModal(LabPatientPage, {
      patient: this.patient,
      isModal: true
    });
    this.popover.dismiss();
  }

  async gotoStat(stat: string) {
    this.nav.navigateForward(['reports', 'stat', stat, this.patient.id], { state: { patient: this.patient } });
    this.popover.dismiss();
  }

}
