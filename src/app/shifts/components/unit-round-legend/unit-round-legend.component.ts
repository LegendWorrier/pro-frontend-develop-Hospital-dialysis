import { forkJoin } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef, Input, Injector, Output, EventEmitter } from '@angular/core';
import { compareAsc, format, formatDistanceToNow } from 'date-fns';
import { AuthService } from 'src/app/auth/auth.service';
import { ShiftsService } from '../../shifts.service';
import { addOrEdit, setupDarkmodeHandler } from 'src/app/utils';
import { Unit } from 'src/app/masterdata/unit';
import { ShiftInfo } from '../../shift-info';
import { ScheduleSection } from 'src/app/schedule/section';
import { Auth } from 'src/app/auth/auth-utils';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { convertStartTimeToDate } from 'src/app/schedule/schedule-utils';

@Component({
  selector: 'app-unit-round-legend',
  templateUrl: './unit-round-legend.component.html',
  styleUrls: ['./unit-round-legend.component.scss'],
})
export class UnitRoundLegendComponent  implements OnInit {

  lastUpdateText: string;
  lastUpdate: Date;

  colors: { [unitId: number]: string } = {};
  incharges: { [unitId: number]: boolean } = {};

  @Input() unitList: Unit[];
  @Input() info: ShiftInfo[];
  @Output() infoChange = new EventEmitter<ShiftInfo[]>();
  @Input() isAuthorized: boolean;
  @Input() multiUnit: boolean;

  private updateTextInterval: NodeJS.Timeout;

  private units: number[];

  constructor(
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private master: MasterdataService,
    private shiftService: ShiftsService,
    private injector: Injector) { }

  async ngOnInit() {
    this.units = this.auth.currentUser.units;
    if (this.auth.currentUser.isPowerAdmin) {
      this.units = this.unitList.map(x => x.id);
    }

    await this.updateInfo();
    this.updateTextInterval = setInterval(() => this.updateText(), 10000);
    
    setupDarkmodeHandler(_ => this.generateColors());
    
  }

  updateText() {
    if (!this.lastUpdate) {
      return;
    }
    this.lastUpdateText = formatDistanceToNow(this.lastUpdate, { addSuffix: true, includeSeconds: true });
    this.cdr.detectChanges();
  }

  async updateInfo() {
    const call$ = this.units.map(unitId => this.shiftService.info(unitId));
    forkJoin(call$).subscribe({
      next: data => {
        this.lastUpdate = new Date();
        this.updateText();

        const newColor = data.length !== this.info.length;
        this.info = data;
        this.infoChange.emit(this.info);
        for (let index = 0; index < this.info.length; index++) {
          const info = this.info[index];
          info.currentSection = info.sections[info.currentShift];
        }
        if (!this.isAuthorized) {
          this.info.forEach(unit => {
            this.shiftService.isInCharge(unit.unitId).subscribe(async isIncharged => {
              this.incharges[unit.unitId] = isIncharged || await Auth.checkIsUnitHeadByUnitId(unit.unitId, this.auth, this.master);
            });
          });
        }

        if (newColor) {
          this.generateColors();
        }
        else {
          this.forExcel();
        }
      },
      error: err => {
        if (err.status !== 404) {
          throw err;
        }
      }
    });
  }

  generateColors() {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const count = this.unitList.length;
    const brightness = isDarkMode ? 0 : 100;
    Array.from(Array(count), () => this.randomColor(brightness)).forEach((color, i) => {
      this.colors[this.unitList[i].id] = color;
    });
    this.forExcel();
  }

  forExcel() {
    this.unitList.forEach((u,i) => {
      const color = this.colors[this.unitList[i].id];
      const shiftUnit = this.info.find(x => x.unitId === this.unitList[i].id);
      if (shiftUnit) {
        shiftUnit.color = color.substring(1);
      }
    });
  }

  randomColor(brightness){
    function randomChannel(br){
      const r = 255 - br;
      const n = 0 | ((Math.random() * r) + br);
      const s = n.toString(16);
      return (s.length === 1) ? '0' + s : s;
    }
    return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
  }

  getUnitName(id: number) {
    return this.unitList.find(x => x.id === id)?.name ?? '??';
  }

  getStartTime(startTime: Date, section: ScheduleSection) {
    if (startTime) {
      return format(new Date(startTime), 'hh:mm a');
    }
    if (!section) {
      return '?';
    }
    return format(convertStartTimeToDate(section.startTime), 'hh:mm a');
  }

  async startNextRound(unitId: number) {
    const call$ = this.shiftService.startNext(unitId);
    await addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: 'Started next round.',
      stay: true,
      isModal: false,
      successCallback: () => {
        this.updateInfo();
      }
    });
  }

  canStartNext(info: ShiftInfo) {
    if (info.sections.length === 0) {
      return false;
    }
    if (this.incharges[info.unitId]) {
      return true;
    }
    const endOfLastShift = convertStartTimeToDate(info.sections[info.sections.length - 1].startTime + 240, new Date());
    const isEnd = info.sections.length === 0 || compareAsc(new Date(), endOfLastShift) > 0;
    return !isEnd;
  }

  ngOnDestroy(): void {
    clearInterval(this.updateTextInterval);
  }

}
