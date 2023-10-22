import { Unit } from '../../masterdata/unit';
import { addHours, addMonths, setDate, startOfDay } from 'date-fns';
import { AlertController } from '@ionic/angular';
import { ScheduleSection } from '../section';
import { addOrEdit, deepCopy } from 'src/app/utils';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ScheduleService } from '../schedule.service';
import { Component, OnInit, Injector } from '@angular/core';
import { formatLocalDateString } from 'src/app/utils-with-date';
import { convertDateToStartTime, convertStartTimeToDate, endTime } from '../schedule-utils';

@Component({
  selector: 'app-schedule-config',
  templateUrl: './schedule-config.page.html',
  styleUrls: ['./schedule-config.page.scss'],
})
export class ScheduleConfigPage implements OnInit {
  unitId: number;
  unitName: string;
  authorized = false;

  maxPerSlot: number;
  isEditing = false;

  isEmpty: boolean;

  sections: ScheduleSection[] = [];
  originalSections: ScheduleSection[];

  pending: ScheduleSection[] = [];
  showOriginal: boolean;

  error: string;

  get isPending() { return this.pending?.length > 0; }

  constructor(
    private scheduleService: ScheduleService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private master: MasterdataService,
    private alertCtl: AlertController,
    private injector: Injector) { }

  ngOnInit() {
    if (this.activatedRoute.snapshot.params.unitId) {
      this.unitId = Number.parseInt(this.activatedRoute.snapshot.params.unitId, 10);
      console.log(this.unitId);
      const unitList = this.master.getTmp() as Unit[];
      if (!unitList) {
        this.master.getUnitList().subscribe(data => {
          this.updateView(data);
        });
      }
      else {
        this.updateView(unitList);
      }
    }
    const navigation = this.router.getCurrentNavigation();
    if (navigation.extras.state?.isEmpty) {
      this.isEmpty = navigation.extras.state.isEmpty;
    }
    else {
      this.scheduleService.checkScheduleEmpty(this.unitId).subscribe(isEmpty => {
        this.isEmpty = isEmpty;
      });
    }

    this.scheduleService.getMaxPerSlot(this.unitId).subscribe(data => this.maxPerSlot = data);
    const sections = this.scheduleService.getTmp() as ScheduleSection[];
    if (sections) {
      this.originalSections = sections;
      this.scheduleService.getPendingOnly(this.unitId).subscribe(pending => {
        this.updateSection(sections, pending);
      });
    }
    else {
      this.scheduleService.getSectionView(this.unitId).subscribe(data => {
        this.updateSection(data.sections, data.pendings);
      });
    }

  }

  async updateView(unitList: Unit[]) {
    const unit = unitList.find(x => x.id === this.unitId);
    this.unitName = unit?.name || '?';
    this.authorized = await this.scheduleService.checkAuthorized(unit);
  }

  updateSection(data: ScheduleSection[], pending: ScheduleSection[] = null) {
    this.sections = pending?.length > 0 ? pending : data;
    if (pending) {
      pending.forEach(x => x.start = formatLocalDateString(convertStartTimeToDate(x.startTime)));
      this.pending = deepCopy(pending);
    }

    if (data) {
      data.forEach(x => x.start = formatLocalDateString(convertStartTimeToDate(x.startTime)));
      this.originalSections = deepCopy(data);
      this.scheduleService.setTmp(this.originalSections);
    }
  }

  isAtLimit() {
    return this.sections.some(x => endTime(x) >= 1440);
  }

  editMax() {
    const call$ = this.scheduleService.setMaxPerSlot(this.unitId, this.maxPerSlot);
    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: {editMode: true, name: 'Max Per Round'},
      isModal: false,
      stay: true
    });
    this.isEditing = false;
  }

  addNewSection() {
    const start = this.sections.length > 0 ?
      addHours(new Date(this.sections[this.sections.length - 1].start), 4) : new Date(1992, 0, 1);
    this.sections.push({
      unitId: this.unitId,
      startTime: convertDateToStartTime(start),
      start: formatLocalDateString(start)
    });
  }

  async delSection(item: ScheduleSection) {
    if (item.id) {
      const alert = await this.alertCtl.create({
        header: 'Delete round warning',
        subHeader: `Round id: ${item.id}`,
        message: 'Are you sure you want to delete this round? Please note that all existing schedule(s) on this round will also be deleted.<br>(Consider editing the start time instead)',
        buttons: [
          {
            text: 'Confirm',
            role: 'ok'
          },
          {
            text: 'Cancel'
          }
        ]
      });
      alert.present();
      const result = await alert.onDidDismiss();
      if (result.role !== 'ok') {
        return;
      }
    }
    this.sections.splice(this.sections.indexOf(item), 1);
  }

  async saveSections() {
    const deletes = this.originalSections.filter(x => !this.sections.find(y => y.id === x.id)).map(x => x.id);
    this.sections.forEach(x => x.startTime = convertDateToStartTime(new Date(x.start)));
    if (this.sections.some((x, i, all) => i !== 0 && x.startTime < all[i - 1].startTime + 60 * 4)) {
      const alert = await this.alertCtl.create({
        header: 'Invalid round gap',
        message: 'Cannot have overlapped rounds gap. The minimum gap is 4 hours per round)',
        buttons: [
          {
            text: 'Ok',
            role: 'ok'
          }
        ]
      });
      alert.present();
      return;
    }

    let targetDate;
    if (!this.isEmpty) {
      const alert = await this.alertCtl.create({
        header: 'Take immediate effect',
        message: 'This unit already has schedule(s) going on, do you want to apply this change at the start of next month?',
        buttons: [
          {
            text: 'This is for next month',
            role: 'ok'
          },
          {
            text: 'Take effect immediately',
            role: 'no'
          }
        ]
      });
      alert.present();
      const result = await alert.onWillDismiss();
      if (result.role === 'ok') {
        targetDate = startOfDay(setDate(addMonths(new Date(), 1), 1));
      }
      else if (result.role !== 'no') {
        return;
      }
    }

    const call$ = this.scheduleService.updateSections(this.unitId, this.sections, deletes, targetDate);
    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: {editMode: true, name: 'Unit\'s rounds'},
      isModal: false,
      stay: true,
      successCallback: (data: ScheduleSection[]) => {
        if (targetDate) {
          this.updateSection(null, data);
        }
        else {
          this.updateSection(data);
        }
      },
      errorCallback: (err) => this.error = err,
      completeCallback: () => this.error = null
    });
  }

  clearPending() {
    if (this.pending) {
      const call$ = this.scheduleService.clearSectionsPending(this.unitId);
      addOrEdit(this.injector, {
        addOrEditCall: call$,
        successTxt: 'Pending change(s) has been cleared',
        isModal: false,
        stay: true,
        successCallback: () => {
          this.pending = null;
          this.sections = deepCopy(this.originalSections);
        }
      });
    }
  }

  private isEqual(...objects: any[]) { return objects.every(obj => JSON.stringify(obj) === JSON.stringify(objects[0])); }

  get canSave() {
    const compareSections = this.pending?.length > 0 ? this.pending : this.originalSections;
    return this.sections.length > 0 &&
    (this.sections.length !== compareSections.length ||
      !this.sections.every((x, i) => this.isEqual(x, compareSections[i])));
  }

  trackByIdentity(index: number, item: ScheduleSection) { return item.id ?? item.start; }

}
