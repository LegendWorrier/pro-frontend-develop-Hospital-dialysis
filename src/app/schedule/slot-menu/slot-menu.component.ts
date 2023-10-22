import { ScheduleView } from './../schedule-view';
import { Unit } from './../../masterdata/unit';
import { TransferMenuComponent } from './transfer-menu/transfer-menu.component';
import { RescheduleMenuComponent } from './reschedule/reschedule-menu.component';
import { ScheduleService } from './../schedule.service';
import { SlotDetailComponent } from './../slot-detail/slot-detail.component';
import { PopoverController, AlertController, LoadingController, NavController } from '@ionic/angular';
import { PatientInfo } from 'src/app/patients/patient-info';
import { Component, Input, OnInit } from '@angular/core';
import { SlotPatientView, SlotView } from '../schedule-view';
import { finalize } from 'rxjs/operators';
import { Schedule } from '../schedule';

export interface SlotMenu {
  slotInfo: SlotPatientView | Schedule;
  patient: PatientInfo;
  slotView: SlotView;

  currentUnit: number;
  unitList: Unit[];

  schedulesCaches: { [unitId: string]: { schedule: ScheduleView } };
  multiUnit: boolean;
  authorized: boolean;
}

@Component({
  selector: 'app-slot-menu',
  templateUrl: './slot-menu.component.html',
  styleUrls: ['./slot-menu.component.scss'],
})
export class SlotMenuComponent implements OnInit, SlotMenu {
  @Input() slotInfo: SlotPatientView | Schedule;
  @Input() patient: PatientInfo;
  @Input() slotView: SlotView;

  @Input() currentUnit: number;
  @Input() unitList: Unit[];

  @Input() schedulesCaches: { [unitId: string]: { schedule: ScheduleView } };
  @Input() multiUnit = false;
  @Input() authorized = false;

  isCross: boolean;

  constructor(
    private popCtl: PopoverController,
    private alertCtl: AlertController,
    private loadCtl: LoadingController,
    private scheduleService: ScheduleService,
    private nav: NavController
    ) { }

  ngOnInit() {
    this.isCross = this.patient.unitId !== this.currentUnit;
  }

  get isSchedule() { return (this.slotInfo as Schedule).date; }

  async reschedule(event) {
    const pop = await this.popCtl.create({
      component: RescheduleMenuComponent,
      event
    });
    pop.present();
  }

  async transfer(event) {
    const pop = await this.popCtl.create({
      component: TransferMenuComponent,
      event
    });
    pop.present();
  }

  swap() {
    this.popCtl.dismiss(this.patient, 'swap', 'schedule-menu');
  }

  async audit(event) {
    const pop = await this.popCtl.create({
      component: SlotDetailComponent,
      componentProps: {
        slotInfo: this.slotInfo,
        patient: this.patient,
        currentUnit: this.currentUnit,
        unitList: this.unitList,
        schedulesCaches: this.schedulesCaches
      },
      event
    });
    await pop.present();
  }

  async patientSchedule() {
    await this.popCtl.dismiss(this.patient, 'schedules', 'schedule-menu');
  }

  async patientInfo() {
    this.popCtl.dismiss(null, null, 'schedule-menu');
    await this.nav.navigateForward(['patients', this.patient.id]);
  }

  async delete() {
    const alert = await this.alertCtl.create({
      header: 'Confirmation',
      subHeader: `Delete Schedule for ${this.patient.name}`,
      message: `Are you sure you want to delete this schedule?`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Confirm',
          role: 'ok'
        }
      ]
    });
    alert.present();

    const result = await alert.onWillDismiss();
    if (result.role === 'ok') {
      const loading = await this.loadCtl.create();
      loading.present();
      const call$ = this.isSchedule ? this.scheduleService.deleteReschedule(this.slotInfo as Schedule)
        : this.scheduleService.deleteSlot(this.patient, this.slotView);

      call$
        .pipe(finalize(() => loading.dismiss()))
        .subscribe({
          next: () =>  {
            this.popCtl.dismiss(this.isSchedule, 'del');
          }
        });
    }
  }
}
