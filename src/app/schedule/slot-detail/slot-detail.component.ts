import { AuthService } from './../../auth/auth.service';
import { take } from 'rxjs/operators';
import { ScheduleService } from './../schedule.service';
import { Unit } from './../../masterdata/unit';
import { format, addDays } from 'date-fns';
import { Schedule } from './../schedule';
import { Component, Input, OnInit } from '@angular/core';
import { PatientInfo } from 'src/app/patients/patient-info';
import { SlotPatientView } from '../schedule-view';
import { convertDateToSectionSlot, convertStartTimeToDate } from '../schedule-utils';

@Component({
  selector: 'app-slot-detail',
  templateUrl: './slot-detail.component.html',
  styleUrls: ['./slot-detail.component.scss'],
})
export class SlotDetailComponent implements OnInit {
  @Input() slotInfo: SlotPatientView | Schedule;
  @Input() patient: PatientInfo;
  @Input() currentUnit: number;
  @Input() unitList: Unit[];

  /**
   * Set to 'True' to show schedule target date/time and unit.
   *
   * @type {boolean}
   * @memberof SlotDetailComponent
   */
  @Input() showDate = false;

  constructor(private scheduleService: ScheduleService, private auth: AuthService) { }

  ngOnInit() {
    if (this.isSchedule) {
      const sectionId = (this.slotInfo as Schedule).sectionId;
      // const isRequest = !this.auth.currentUser.units.includes(this.patient.unitId);
      this.scheduleService.getScheduleFromCache(this.patient.unitId, false, true)
        .subscribe(cache =>  {
          const section = cache?.schedule.sections.find(x => x.section.id === sectionId);
          if (!section) {
            console.log('no cache for section, manually get from server ...');
            this.scheduleService.getSections(this.patient.unitId)
              .pipe(take(1)).subscribe(data =>  {
                this.scheduleService.schedulesCaches = {};
                this.scheduleService.schedulesCaches[this.patient.unitId] = {
                  schedule : {
                    patients: [this.patient],
                    reschedules: [],
                    sections: data.map(x => ({ section: x, slots: [] })),
                    unitId: this.patient.unitId
                  },
                  lastUpdate: new Date()
                };
              });
          }
        });
    }
  }

  get isSchedule() { return (this.slotInfo as Schedule).date; }

  get origin() {
    if (!this.isSchedule) {
      return '';
    }
    const schedule = this.slotInfo as Schedule;
    let origin = '';
    if (schedule.originalDate) {
      origin += format(new Date(schedule.originalDate), 'eee, dd MMM hh:mm a');
    }
    else {
      const sectionId = schedule.sectionId;
      const cached = this.scheduleService.getLastScheduleCache(this.patient.unitId);
      const section = cached?.schedule.sections.find(x => x.section.id === sectionId);
      if (!section) {
        console.log('no section info');
      }

      const today = new Date();
      const dayOfWeek = convertDateToSectionSlot(today);
      const originDate = convertStartTimeToDate(
        section?.section.startTime ?? 0,
        addDays(today, schedule.slot - dayOfWeek)
      );
      origin += format(originDate, 'eee hh:mm a');
      origin += ' (extra)';
    }

    if (this.patient.unitId !== this.currentUnit) {
      origin = `${this.unitList.find(x => x.id === this.patient.unitId).name || '(Unknown Unit)'} ${origin}`;
    }

    return origin;
  }

  get dateLabel() {
    if (!this.isSchedule) {
      return '';
    }
    const schedule = this.slotInfo as Schedule;
    let date = format(new Date(schedule.date), 'eee, dd MMM hh:mm a');
    if (schedule.overrideUnitId) {
      date = `${date} at ${this.unitList.find(x => x.id === schedule.overrideUnitId).name || '(Unknown Unit)'}`;
    }

    return date;
  }

}
