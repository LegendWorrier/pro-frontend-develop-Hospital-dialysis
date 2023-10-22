import { SlotView } from './../../schedule-view';
import { ScheduleService, ScheduleCache } from './../../schedule.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SectionView } from '../../schedule-view';
import { ScheduleSection } from '../../section';
import compareAsc from 'date-fns/compareAsc';
import isSameDay from 'date-fns/isSameDay';
import { Schedule } from '../../schedule';
import { SectionSlots } from 'src/app/enums/section-slots';
import { convertDateToSectionSlot, endTimeAsDate, convertStartTimeToDate, convertDateToStartTime } from '../../schedule-utils';

export interface SectionSelectData {
  date: Date;
  patientId: string;
  origin: SlotView;
  originDate?: Date;
  cached: ScheduleCache;
  currentUnit: number;
}

@Component({
  selector: 'app-section-select',
  templateUrl: './section-select.component.html',
  styleUrls: ['./section-select.component.scss'],
})
export class SectionSelectComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<SectionSelectComponent>,
              @Inject(MAT_DIALOG_DATA) public data: SectionSelectData,
              private scheduleService: ScheduleService) { }

  sectionList: SectionView[];

  private slotDay: SectionSlots;
  private occupiedSections: ScheduleSection[];
  private occupiedSchedules: Schedule[];

  private originalCache: ScheduleCache;
  private isCross: boolean;

  ngOnInit() {
    this.sectionList = this.data.cached.schedule.sections;

    this.isCross = this.data.currentUnit !== this.data.cached.schedule.unitId;
    if (this.isCross) {
      this.originalCache = this.scheduleService.getLastScheduleCache(this.data.currentUnit);
    }
    else {
      this.originalCache = this.data.cached;
    }

    this.slotDay = convertDateToSectionSlot(this.data.date);
    this.occupiedSections = this.originalCache.schedule.sections.filter(x => x.slots[this.slotDay].patientList.some(p =>
      p.patientId === this.data.patientId)).map(x => x.section);
    this.occupiedSchedules = this.data.cached.schedule.reschedules.filter(x =>
      x.patientId === this.data.patientId && isSameDay(new Date(x.date), this.data.date));

  }

  endTime(section: ScheduleSection) {
    return endTimeAsDate(section);
  }

  onSelect(item: ScheduleSection) {
    this.dialogRef.close(item);
  }

  isPast(item: ScheduleSection) {
    const target = convertStartTimeToDate(item.startTime, this.data.date);
    return compareAsc(new Date(), target) > 0;
  }

  isOccupied(item: ScheduleSection) {
    const hasOtherSchedule = this.originalCache.schedule.reschedules.some(x => x.patientId === this.data.patientId
      && x.originalDate && isSameDay(new Date(x.originalDate), this.data.date)
      && convertDateToStartTime(x.originalDate) === item.startTime);

    // slot
    if (!hasOtherSchedule && this.occupiedSections.find(x => this.scheduleService.isOverlapped(x.startTime, item.startTime))) {
      return true;
    }
    // schedule
    if (this.occupiedSchedules.some(x =>
      this.scheduleService.isOverlapped(convertDateToStartTime(x.date), item.startTime))) {
      return true;
    }
    // original schedule
    if (this.isCross) {
      const hasOriginalSchedule = this.originalCache.schedule.reschedules.some(x => {
        const wrap = new Date(x.date);
        const startTime = convertDateToStartTime(wrap);
        return x.patientId === this.data.patientId && isSameDay(wrap, this.data.date)
          && this.scheduleService.isOverlapped(startTime, item.startTime);
      });

      if (hasOriginalSchedule) {
        return true;
      }
    }

    return false;
  }

  isFull(item: ScheduleSection) {
    const slot = this.data.cached.schedule.sections.find(x => x.section.id === item.id).slots[this.slotDay];
    return this.scheduleService.checkMaxPerSlot(slot, this.data.cached.schedule.reschedules, this.data.cached.maxPerSlot, this.data.date);
  }

}
