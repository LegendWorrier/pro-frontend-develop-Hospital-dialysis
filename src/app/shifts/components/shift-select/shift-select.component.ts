import { PopoverController } from '@ionic/angular';
import { ScheduleSection } from './../../../schedule/section';
import { Component, Input, OnInit } from '@angular/core';
import { ShiftInfo } from '../../shift-info';
import { ShiftData } from '../../shift-slot';
import { convertStartTimeToDate, endTimeAsDate } from 'src/app/schedule/schedule-utils';

@Component({
  selector: 'app-shift-select',
  templateUrl: './shift-select.component.html',
  styleUrls: ['./shift-select.component.scss'],
})
export class ShiftSelectComponent implements OnInit {

  @Input() info: ShiftInfo;

  selects: boolean[];

  constructor(private pop: PopoverController) { }

  ngOnInit() {
    // console.log(this.info);
    if (!this.info) {
      throw new Error('Cannot retrieve shift and round info. Please contact administrator.');
    }
    this.selects = Array(this.info.sections.length).fill(false);
  }

  getStartTime(section: ScheduleSection) {
    return convertStartTimeToDate(section.startTime);
  }

  getEndTime(section: ScheduleSection) {
    return endTimeAsDate(section);
  }

  all() {
    for (let index = 0; index < this.selects.length; index++) {
      this.selects[index] = true;
    }
  }

  confirm() {
    let hasAny = false;
    let shifts: ShiftData;
    for (let index = 0; index < this.selects.length; index++) {
      if (this.selects[index]) {
        hasAny = true;
        switch (index) {
          case 0:
            shifts |= ShiftData.Section1;
            break;
          case 1:
            shifts |= ShiftData.Section2;
            break;
          case 2:
            shifts |= ShiftData.Section3;
            break;
          case 3:
            shifts |= ShiftData.Section4;
            break;
          case 4:
            shifts |= ShiftData.Section5;
            break;
          case 5:
            shifts |= ShiftData.Section6;
            break;
          default:
            break;
        }
      }
    }

    if (!hasAny) {
      this.pop.dismiss(null);
    }
    else {
      this.pop.dismiss(shifts);
    }
  }

}
