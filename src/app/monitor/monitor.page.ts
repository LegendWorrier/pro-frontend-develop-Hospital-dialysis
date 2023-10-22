import { StorageService } from './../share/service/storage.service';
import { RecordService } from 'src/app/dialysis/record.service';
import { DialysisRecordInfo } from 'src/app/dialysis/dialysis-record';
import { map } from 'rxjs/operators';
import { PatientService } from './../patients/patient.service';
import { ScheduleService } from './../schedule/schedule.service';
import { ModalSearchListComponent, ModalSearchParams } from './../share/components/modal-search-list/modal-search-list.component';
import { ModalService } from './../share/service/modal.service';
import { compareDesc, differenceInMinutes } from 'date-fns';
import { AuthService } from './../auth/auth.service';
import { MasterdataService } from './../masterdata/masterdata.service';
import { AlarmListComponent } from './alarm-list/alarm-list.component';
import { PopupMenuComponent } from './../share/components/popup-menu/popup-menu.component';
import { PopupStringInputComponent } from './../share/components/popup-string-input/popup-string-input.component';
import { PatientBasicInfo } from './patient-basic-info';
import { NavController, PopoverController } from '@ionic/angular';
import { Alarm } from './alarm';
import { AlertInfo } from './alert-info';
import { BedBox } from './bed-box';
import { WebSocketService } from './../share/service/web-socket.service';
import { Component, OnInit, ChangeDetectorRef, EventEmitter, Injector, isDevMode, NgZone } from '@angular/core';
import { BoxStatus } from './box-status';
import { Unit } from '../masterdata/unit';
import { mailString, presentToast, ToastType, checkGuidEmpty } from '../utils';
import { Observable } from 'rxjs';
import { PatientInfo } from '../patients/patient-info';
import { HemoDialysisService } from '../dialysis/hemo-dialysis.service';
import { emptyGuid } from '../share/guid';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.page.html',
  styleUrls: ['./monitor.page.scss'],
})
export class MonitorPage implements OnInit {

  get isDebug() { return isDevMode() }

  get selectableUnits(): Unit[] {
    const list = this.auth.currentUser.isPowerAdmin ? this.unitList 
          : this.unitList.filter(x => this.auth.currentUser.units.includes(x.id));
    return list?.concat(this.multiUnit ? [{
      id: 0,
      name: 'Unknown',
      headNurse: null
    }] : []);
  }

  unitList: Unit[] = [];
  selectedUnit: number;
  multiUnit: boolean;

  canEdit: boolean = true;

  getBedList(unit: number) { return !unit ? this.beds.filter(x => !x.UnitId) : this.beds.filter(x => x.UnitId === unit); }

  beds: BedBox[] = [];
  get isConnected(): boolean { return this.websocket.IsConnect; }

  alerts: { [macAddress: string]: AlertInfo[] } = {};

  loadGuard: { [macAddress: string]:boolean } = {};

  get showAds(): boolean { return this.auth.ExpiredMode && !this.isAdsClosed; }
  isAdsClosed = false;
  mailString = mailString;
  closeAds() {
    this.isAdsClosed = true;
  }

  constructor(
    private auth: AuthService,
    private websocket: WebSocketService,
    private scheduleService: ScheduleService,
    private patientService: PatientService,
    private hemoService: HemoDialysisService,
    private recordService: RecordService,
    private popup: PopoverController,
    private modal: ModalService,
    private master: MasterdataService,
    private nav: NavController,
    private storage: StorageService,
    private injector: Injector,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone) { }

  async ngOnInit() {
    this.multiUnit = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units.length > 1;
    this.master.getUnitListFromCache().then((data)  => {
      this.unitList = data;
      this.selectedUnit = this.auth.currentUser.units[0] ?? this.unitList[0].id;
    });
    this.websocket.setupConnection(conn => {
      conn.on('BedUpdate', (bed: BedBox) => {
        console.log('box update: ', bed);
        const existing = this.beds.find(x => x.MacAddress === bed.MacAddress);
        if (existing) {
          Object.assign(existing, bed);
          if (!bed.Patient) {
            existing.HemosheetId = undefined;
          }
        }
        else {
          this.beds.push(bed);
        }
        console.log('updated: ', existing);
        this.cdr.detectChanges();
        this.loadGuard[bed.MacAddress] = false;
      });
      conn.on('BoxChangeUnit', (macAddress: string, unitId: number) => {
        console.log('Box change unit => ' + !unitId ? null : this.unitList? this.unitList.find(x => x.id === unitId).name : unitId);
        const bed = this.beds.find(x => x.MacAddress === macAddress);
        if (!this.auth.currentUser.isPowerAdmin && !this.auth.currentUser.units.includes(unitId)) {
          this.beds.splice(this.beds.indexOf(bed), 1);
        }
        else {
          bed.UnitId = unitId;
        }
        
        this.cdr.detectChanges();
        this.loadGuard[macAddress] = false;
      });
      conn.on('BedDelete', (macAddress: string) => {
        console.log('box delete: ', macAddress);
        this.beds.splice(this.beds.indexOf(this.beds.find(x => x.MacAddress === macAddress)), 1);
        this.cdr.detectChanges();
        this.loadGuard[macAddress] = undefined;
      });
      conn.on('BedPatient', (macAddress: string, patient: PatientBasicInfo) => {
        console.log('box select patient: ', patient.Id);
        const target = this.beds.find(x => x.MacAddress === macAddress);
        target.PatientId = patient.Id;
        target.Patient = patient;
        this.cdr.detectChanges();
        this.loadGuard[macAddress] = false;
      });
      conn.on('BoxStatus', (macAddress: string, status: BoxStatus) => {
        console.log('box status change: ', BoxStatus[status]);
        const target = this.beds.find(x => x.MacAddress === macAddress);
        if (status > 1) {
          target.Online = (status === BoxStatus.online);
        }
        else {
          target.Sending = (status === BoxStatus.sending);
        }
        this.cdr.detectChanges();
        this.loadGuard[macAddress] = false;
      });
      conn.on('BoxAlert', (macAddress: string, alarm: Alarm) => {
        console.log('box alert: ', Alarm[alarm]);
        this.addAlert(macAddress, alarm);

        this.cdr.detectChanges();
        this.loadGuard[macAddress] = false;
      });

      conn.onreconnecting(() => { this.cdr.detectChanges(); this.loadGuard = {}; });
    });

    await this.websocket.startServerConnection();
    await this.updateMonitorList();

    this.websocket.OnConnected.subscribe(async () => {
      await this.updateMonitorList()
      if (!this.unitList || this.unitList.length === 0) {
        this.master.getUnitListFromCache().then((data)  => this.unitList = data);
      }
    });
    
  }

  async updateMonitorList() {
    this.beds = await this.websocket.getMonitorList() ?? [];
    this.alerts = await this.websocket.getAlertRecords() ?? {};
    await this.initAlertDismissState();
    console.log('get initial monitor data complete.');

    // debug 
    // console.log('adding alert');
    // const mac = this.beds[0].MacAddress;
    // this.addAlert(mac, Alarm.Other);
    
    this.cdr.detectChanges();
  }

  async initAlertDismissState() {
    if (this.alerts) {
      for (const mac in this.alerts) {
        if (Object.prototype.hasOwnProperty.call(this.alerts, mac)) {
          const items = this.alerts[mac];
          items.sort((a, b) => compareDesc(new Date(a.Timestamp), new Date(b.Timestamp)));
          var last = await this.storage.get(`alert-dismiss-${this.auth.currentUser.id}-${mac}`);
          if (!last) {
            continue;
          }
          last = new Date(last);
          items.filter(x => new Date(x.Timestamp) <= last).forEach(x => x.Dismiss = true);
        }
      }
    }
  }

  isOtherAlarm(item: BedBox) {
    return this.alerts[item.MacAddress]?.filter(x => !x.Dismiss).every(x => x.Type === Alarm.Other);
  }

  async addAlert(macAddress: string, alrmType: Alarm) {
    if (!this.alerts) {
      this.alerts = {};
    }
    if (!this.alerts[macAddress]) {
      this.alerts[macAddress] = [];
    }
    this.alerts[macAddress].unshift({ Timestamp: new Date(), Type: alrmType } as AlertInfo);
    this.playAlertSound();
  }

  async onUnitChange(event) {
    const unitId = event.detail.value;
    this.selectedUnit = unitId;
    this.canEdit = this.selectedUnit != 0 || this.auth.currentUser.isPowerAdmin;
  }

  patient(patientId: string, goToRecordTab = false) {
    this.ngZone.run(() => this.nav.navigateForward(['patients', patientId], { queryParams: { goToRecordTab } }));
    
  }

  async openReport(item: BedBox) {
    if (!item.PatientId || !item.Patient) {
      presentToast(this.injector, {
        header: 'No patient',
        message: 'No patient selected for this HemoBox.',
        native: true
      });
      return;
    }
    if (!item.HemosheetId) {
      const hemosheet = await this.hemoService.getPatientHemosheet(item.PatientId).toPromise();
      item.HemosheetId = hemosheet?.id ?? emptyGuid();
    }
    if (checkGuidEmpty(item.HemosheetId)) {
      presentToast(this.injector, {
        header: 'No active hemosheet',
        message: 'This patient has no active hemosheet.',
        native: true
      });
      return;
    }
    this.nav.navigateForward(['reports', 'hemo-records', item.HemosheetId]);
  }

  async editName(item: BedBox) {
    const edit = await this.popup.create({
      component: PopupStringInputComponent,
      componentProps: {
        title: 'Name/No',
        placeholder: 'Enter new name or bed No.'
      }
    });
    edit.present();

    const result = await edit.onWillDismiss();
    console.log(result);
    if (result.role === 'ok') {
      if (this.loadGuard[item.MacAddress]) {
        return;
      }
      this.loadGuard[item.MacAddress] = true;
      this.websocket.changeBedName(item, result.data);
    }
  }

  changeState(item: BedBox) {
    this.websocket.changeBoxState(item);
  }

  async complete(item: BedBox) {
    if (!await this.websocket.complete(item)) {
      console.error('wrong authorize')
    }
  }

  isOnline(item: BedBox) {
    return item.Online && this.isConnected;
  }

  isDismissAll(item: BedBox) {
    return !this.alerts[item.MacAddress] || this.alerts[item.MacAddress].every(x => x.Dismiss);
  }

  async alarmMenu(item: BedBox, event) {
    console.log('alarm menu');
    const menu = await this.popup.create({
      component: PopupMenuComponent,
      componentProps: {
        menuList: [
          {
            display: 'All Alarms (Today)',
            name: 'list'
          },
          {
            display: 'Dismiss',
            name: 'dismiss',
            disable: this.isDismissAll(item)
          }
        ]
      },
      event
    });
    menu.present();
    const result = await menu.onWillDismiss();
    if (result.role === 'ok') {
      console.log(result);
      if (result.data === 'dismiss') {
        await this.dismissAll(item);
      }
      else if (result.data === 'list') {
        this.showAlarmList(item, event);
      }
    }
  }

  async dismissAll(item: BedBox) {
    this.alerts[item.MacAddress].forEach(x => x.Dismiss = true);
    const last = this.alerts[item.MacAddress].sort((a, b) => compareDesc(new Date(a.Timestamp), new Date(b.Timestamp)))[0].Timestamp;
    await this.storage.set(`alert-dismiss-${this.auth.currentUser.id}-${item.MacAddress}`, new Date(last).toISOString());
  }

  async showAlarmList(item: BedBox, event) {
    const list = await this.popup.create({
      component: AlarmListComponent,
      componentProps: {
        list: this.alerts[item.MacAddress]
      },
      event,
      cssClass: ['hemo-popup', 'alert-list-popup']
    });
    list.present();
  }

  playAlertSound(){
    let audio = new Audio();
    audio.src = "assets/audio/alarm.wav";
    audio.load();
    audio.play();
  }

  async getDataNow(item: BedBox) {
    if (this.loadGuard[item.MacAddress]) {
      return;
    }
    this.loadGuard[item.MacAddress] = true;
    const result = await this.websocket.getData({ bed: item })
      .catch(err => {
        console.log(err.message);
        return null as DialysisRecordInfo;
      })
      .finally(() => this.loadGuard[item.MacAddress] = false);
    console.log('get data', result);
    if (result) {
      this.recordService.setTmp(result);
      this.patient(item.PatientId, true);
    }
    else {
      presentToast(this.injector, {native: true, message: 'The target HemoBox cannot get data from the machine right now.', type: ToastType.alert});
    }
  }

  async pickPatient(item: BedBox, event) {
    if (this.loadGuard[item.MacAddress]) {
      return;
    }

    const select = await this.popup.create({
      component: PopupMenuComponent,
      componentProps: {
        menuList: [{ display: 'All Patients', name: 'all' }, { display: 'Today Patients', name: 'today' }]
      },
      event
    });
    select.present();
    const selectResult = await select.onWillDismiss();
    if (selectResult.role !== 'ok') {
      return;
    }

    const all = selectResult.data === 'all';
    const onReload = new EventEmitter();
    const patientList = await this.modal.openModal(ModalSearchListComponent, {
      data: this.getPatientList(item.UnitId, all),
      title: 'Patient Select',
      searchText: 'Search by name',
      getSearchKey: (p: PatientInfo) => p.name,
      hasReload: true,
      onReload,
      lastUpdate: () => all ? this.patientService.getLastCacheUpdate(item.UnitId) : this.todayCache[item.UnitId]?.lastUpdate
    } as ModalSearchParams<PatientInfo>);
    onReload.subscribe(() => {
      if (all) {
        this.patientService.forceRefreshCache();
      }
      else {
        this.forceReloadToday = true;
      }
    });
    const patientResult = await patientList.onWillDismiss();

    if  (patientResult.role === 'ok') {
      const patientId = patientResult.data.id;
      const result = await this.websocket.pickPatient(item, patientId);
      if (!result) {
        console.log(`Cannot pick the patient with box: ${item.MacAddress}, patientId: ${patientId}`);
        return;
      }
      item.Patient = result;
      item.PatientId = result.Id;
    }
  }

  // ======= cache =========
  private todayCache: { [unitId: number]: { list: PatientInfo[], lastUpdate?: Date } } = {};
  private forceReloadToday: boolean;
  private readonly cacheTime = 15;

  // =============== Get Patient List for HemoBox =====================
  getPatientList(unitId: number, all: boolean): Observable<PatientInfo[]> {
    const noDuplicate = (patient: PatientInfo) => {
      return !this.beds.some(x => x.PatientId === patient.id);
    };

    if (all) {
      return this.patientService.getAccumulatedPatientByUnit(unitId).pipe(map(data => data.filter(noDuplicate)));
    }
    else {
      return new Observable<PatientInfo[]>(sub => {
        const cached = this.todayCache[unitId];
        if (this.forceReloadToday || !cached || differenceInMinutes(new Date(), cached.lastUpdate) >= this.cacheTime) {
          this.forceReloadToday = false;
          this.scheduleService.getTodayPatient(unitId).pipe(map(list => {
            const newCache = {
              list,
              lastUpdate: new Date()
            };
            this.todayCache[unitId] = newCache;
            return newCache.list;
          })).subscribe(data => sub.next(data.filter(noDuplicate)));
        }
        else {
          sub.next(cached.list.filter(noDuplicate));
        }
      });
    }
  }

  // ======================== Debug Util =================================

  private makeid(length) {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  addBed() {
    
    const bed = {
      MacAddress: this.makeid(10),
      Name: null,
      Online: true,
      Sending: false
    } as BedBox;

    (bed as any).debug = true;

    this.beds.push(bed);
    this.cdr.detectChanges();
  }

}
