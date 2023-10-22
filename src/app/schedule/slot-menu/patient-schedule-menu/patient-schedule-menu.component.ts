import { PatientInfo } from 'src/app/patients/patient-info';
import { PopoverController, AlertController, LoadingController } from '@ionic/angular';
import { format } from 'date-fns';
import { ScheduleService } from './../../schedule.service';
import { SlotView } from './../../schedule-view';
import { Schedule } from './../../schedule';
import { Component, Input, OnInit, Renderer2, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { SlotDetailComponent } from '../../slot-detail/slot-detail.component';
import { Unit } from 'src/app/masterdata/unit';
import { finalize } from 'rxjs/operators';
import { convertStartTimeToDate } from '../../schedule-utils';

@Component({
  selector: 'app-patient-schedule-menu',
  templateUrl: './patient-schedule-menu.component.html',
  styleUrls: ['./patient-schedule-menu.component.scss'],
})
export class PatientScheduleMenuComponent implements OnInit, AfterViewInit {
  @Input() patient: PatientInfo;
  @Input() date: Date;
  @Input() slot: SlotView;
  @Input() schedules: Schedule[];

  @Input() currentUnit: number;
  @Input() unitList: Unit[];
  @Input() authorized: boolean;

  @Input() selected: SlotView | Schedule;
  @Input() readOnly: boolean;

  get isSchedule() { return (this.selected as Schedule)?.date; }

  private popupContent: HTMLElement;

  constructor(
    private scheduleService: ScheduleService,
    private popCtl: PopoverController,
    private alertCtl: AlertController,
    private loadCtl: LoadingController,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef) { }

  async ngAfterViewInit() {
    

    setTimeout(async () => {
      const popup = await this.popCtl.getTop();
      this.popupContent = popup.shadowRoot.querySelector<HTMLElement>('.popover-content');
      
      this.checkPosition();
    }, 50);
  }

  ngOnInit() {
    if (this.schedules.length === 0) {
      this.selected = this.slot;
    }
    else if (this.schedules.length === 1 && !this.slot) {
      this.selected = this.schedules[0];
    }
  }

  getLabel(item: Schedule | SlotView, full = false) {
    let label = '';
    let tmp: Date;
    const isSchedule = (item as Schedule).date;
    if (isSchedule) {
      tmp = new Date((item as Schedule).date);
    }
    else {
      tmp = convertStartTimeToDate((item as SlotView).sectionStartTime);
    }

    label += format(tmp, 'hh:mm a (eee)');

    if (full) {
      label += format(this.date, ', dd MMM yyyy');
    }

    if ((item as Schedule).overrideUnitId) {
      label += ` at ${this.unitList.find(x => x.id === (item as Schedule).overrideUnitId).name}`;
    }

    return label;
  }

  checkPosition() {
    const screenH = window.innerHeight;
    const top = parseFloat(this.popupContent.style.top.substring(0, this.popupContent.style.top.length - 2));
    if (top + this.popupContent.clientHeight > screenH) {
      const newTop = screenH - this.popupContent.clientHeight - 5;
      this.renderer.setStyle(this.popupContent, 'top', `calc(${newTop}px - var(--ion-safe-area-bottom, 0))`);
      this.cdr.detectChanges();
      return;
    }
    if (top < 0) {
      const newTop = 5;
      this.renderer.setStyle(this.popupContent, 'top', `calc(${newTop}px + var(--ion-safe-area-top, 0))`);
      this.cdr.detectChanges();
      return;
    }
  }

  async onSelect(item: Schedule | SlotView) {
    this.selected = item;

    setTimeout(() => {
      this.checkPosition();
    }, 50);
  }

  reschedule() {
    this.popCtl.dismiss(this.selected, 'reschedule');
  }

  transfer() {
    this.popCtl.dismiss(this.selected, 'transfer');
  }

  async audit(event) {
    console.log(event);
    const slotInfo = this.isSchedule ? this.selected : this.slot.patientList.find(x => x.patientId === this.patient.id);

    const pop = await this.popCtl.create({
      component: SlotDetailComponent,
      componentProps: {
        slotInfo,
        patient: this.patient,
        currentUnit: this.currentUnit,
        unitList: this.unitList,
        showDate: true
      },
      event
    });
    pop.present();
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
      const call$ = this.isSchedule ? this.scheduleService.deleteReschedule(this.selected as Schedule)
        : this.scheduleService.deleteSlot(this.patient, this.slot);

      call$
        .pipe(finalize(() => loading.dismiss()))
        .subscribe({
          next: () =>  {
            this.popCtl.dismiss(this.selected, 'del');
          }
        });
    }
  }

}
