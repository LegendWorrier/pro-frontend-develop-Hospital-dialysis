import { NgModel } from '@angular/forms';
import { AppConfig } from './../../app.config';
import { PopupStringInputComponent } from './../../share/components/popup-string-input/popup-string-input.component';
import { finalize } from 'rxjs/operators';
import { HisService } from './../../share/service/his.service';
import { Unit } from './../../masterdata/unit';
import { HemoDialysisService } from 'src/app/dialysis/hemo-dialysis.service';
import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonRouterOutlet, ModalController, Platform, AlertController, LoadingController, PopoverController, IonInput } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user';
import { UserService } from 'src/app/auth/user.service';
import { AdmissionType } from 'src/app/enums/admission-type';
import { CoverageSchemeType } from 'src/app/enums/coverage-scheme-type';
import { StatusCategories } from 'src/app/enums/status-categories';
import { Data } from 'src/app/masterdata/data';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Status } from 'src/app/masterdata/status';
import { addOrEdit, deepCopy, getName, presentToast, ToastType } from 'src/app/utils';
import { BloodSign, BloodType, Patient } from '../patient';
import { PatientService } from '../patient.service';
import { TagDetailComponent } from '../tag-detail/tag-detail.component';
import { formatISO } from 'date-fns';
import { BehaviorSubject } from 'rxjs';
import { Gender } from 'src/app/enums/gender';
import { Tag, PatientInfo } from '../patient-info';
import { getMasking, getPlaceholder } from 'src/app/identity';
import { BrMaskDirective } from 'src/app/directive/br-mask.directive';
import { KidneyState } from '../../enums/kidney-state';
import { UserUtil } from 'src/app/auth/user-utils';

@Component({
  selector: 'app-edit-patient',
  templateUrl: './edit-patient.page.html',
  styleUrls: ['./edit-patient.page.scss', '../../share/components/tag/tag.component.scss'],
})
export class EditPatientPage implements OnInit, AfterViewInit {
  @ViewChild(IonContent) content: IonContent;
  patient = new Patient;
  currentId: string;
  currentUnit: number;
  error: string;

  isPowerAdmin: boolean;
  isAdmin: boolean;
  editMode: boolean;
  canDelete: boolean;
  status: StatusCategories;

  hisEnabled: boolean;
  useHN: boolean;

  identity = "nid";
  idPlaceholder = getPlaceholder(); // TODO: dynamic for each country
  idMasking = getMasking(); // TODO: dynamic for each country

  maxDate: string;
  get width(): number { return this.plt.width(); }
  getName = getName;

  genders = [{ text: 'Male', value: Gender.Male }, { text: 'Female', value: Gender.Female }];
  bloodType = Object.keys(BloodType).filter(key => !isNaN(Number(BloodType[key]))).map(k => ({ text: k, value: BloodType[k]}));
  bloodSign = Object.values(BloodSign).map(v => ({ text: v, value: v }));
  admissions = Object.values(AdmissionType).map(v => ({ text: v, value: v }));
  coverages = Object.values(CoverageSchemeType).map(v => ({ text: v, value: v }));
  kidneyStates = Object.keys(KidneyState).filter(key => !isNaN(Number(KidneyState[key]))).map(k => ({ text: k, value: KidneyState[k] }));

  unitList: BehaviorSubject<Unit[]> = new BehaviorSubject<Unit[]>(null);
  doctorList: BehaviorSubject<User[]> = new BehaviorSubject<User[]>(null);

  allUnits: Unit[] = [];
  allDoctors: User[] = [];

  statusList: BehaviorSubject<Status[]> = new BehaviorSubject<Status[]>(null);
  deathCauseList: BehaviorSubject<Data[]> = new BehaviorSubject<Data[]>(null);
  medicineList: Data[];

  allergyList: Data[] = [];
  medicineHistoryList: Data[] = [];

  @ViewChild('identityNoEl', {static: true}) identityNoEl!: IonInput;
  @ViewChild('identityNoEl', { read: BrMaskDirective }) identityMask!: BrMaskDirective;
  @ViewChild('identityNoEl', { read: NgModel }) identityNg: NgModel;

  constructor(
    private activatedRoute: ActivatedRoute,
    private master: MasterdataService,
    private auth: AuthService,
    private userService: UserService,
    private patientService: PatientService,
    private hemoService: HemoDialysisService,
    private modal: ModalController,
    private routerOutlet: IonRouterOutlet,
    private plt: Platform,
    private alertCtl: AlertController,
    private injector: Injector,
    private loadCtl: LoadingController,
    private popup: PopoverController,
    private his: HisService,
    private cdr: ChangeDetectorRef)
    {
      this.isPowerAdmin = this.auth.currentUser.isPowerAdmin;
      this.isAdmin = this.auth.currentUser.isAdmin;
      this.canDelete = auth.currentUser.checkPermission('patient-del');
    }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.identityNoEl.value = this.identityMask.returnValue(this.patient.identityNo);
      console.log('model', this.patient.identityNo);
    });
  }

  ngOnInit() {
    this.loadDoctorList();
    this.loadUnitList();

    this.master.getStatusList().subscribe(data => {
      this.statusList.next(data);
      this.selectStatus();
    });
    this.master.getDeathCauseList().subscribe(data => {
      this.deathCauseList.next(data);
    });
    this.master.getMedicineList().subscribe((data) => {
      this.medicineList = data;
      this.updateMedicineList();
    });

    if (this.activatedRoute.snapshot.params.id) {
      this.editMode = true;
      this.currentId = decodeURIComponent(this.activatedRoute.snapshot.params.id);
      const data = this.patientService.getTmp() || this.activatedRoute.snapshot.data.patient;
      this.patient = this.clone(data);
      this.currentUnit = this.patient.unitId;
      this.updateMedicineList();
    }
    const date = new Date();
    this.maxDate = formatISO(date);
    this.hisEnabled = AppConfig.config.enableHIS && AppConfig.config.centerType === 'hospital';
    this.useHN = AppConfig.config.patient?.useHnOnly;

    setTimeout(() => {
      const idNo = this.patient.identityNo;
      if (idNo && (idNo.length === 9 || idNo.length === 7)) {
        this.identity = "passport";
      }
    });
  }

  clone(data: Patient): Patient {
    const copy = deepCopy(data) as PatientInfo;
    const result = Object.assign(new Patient, copy);
    return result;
  }

  async loadDoctorList() {
    this.allDoctors = (await UserUtil.getDoctorListFromCache(this.userService)).sort(this.sortUser);
    this.updateDoctorList();
  }

  loadUnitList() {
    this.master.getUnitList().subscribe((data) => {
      this.allUnits = data;
      if (this.auth.currentUser.isPowerAdmin) {
        this.unitList.next(this.allUnits);
      }
      else {
        const units = this.auth.currentUser.units;
        this.unitList.next(this.allUnits.filter(x => units.includes(x.id)));
      }

      if (this.unitList.value.length === 1 && !this.activatedRoute.snapshot.params.id) {
        this.patient.unitId = this.unitList.value[0].id;
      }
    });
  }

  selectUnit() {
    // reset doctor for new unit
    if (this.patient.doctorId) {
      const doctor = this.allDoctors.find(x => x.id === this.patient.doctorId && x.units.includes(this.patient.unitId));
      if (!doctor) {
        this.patient.doctorId = null;
      }
    }
    this.updateDoctorList();
  }
  selectDoctor() {
    if (this.patient.doctorId) {
      const doctorUnits = this.allDoctors.find(x => x.id === this.patient.doctorId).units;
      if (doctorUnits.length === 1) {
        this.patient.unitId = doctorUnits[0];
      }
      this.updateUnitList(doctorUnits);
    }
  }
  updateDoctorList() {
    if (this.patient.unitId) {
      console.log(this.patient.unitId);
      console.log(this.allDoctors);
      this.doctorList.next(this.allDoctors.filter(x => x.units.includes(this.patient.unitId)));
    }
    else {
      this.doctorList.next(this.allDoctors);
    }
  }
  updateUnitList(units?: number[]) {
    if (this.patient.doctorId && !this.patient.unitId) {
      if (!units) {
        units = this.allDoctors.find(x => x.id === this.patient.doctorId).units;
      }
      this.unitList.next(this.allUnits.filter(x => units.includes(x.id)));
    }
    else {
      this.unitList.next(this.allUnits);
    }
  }

  disableBloodSign(): boolean {
    return this.patient.blood === BloodType.Unknown || !this.patient.blood;
  }

  placeholder(text: string): string {
    if (this.plt.width() > 1199) {
      return this.plt.width() > 1566 ? `Select the ${text}` : text;
    }
    return this.plt.width() > 583 ? `Select the ${text}` : 'Select';
  }

  getMedicine(id: number) {
    return this.medicineList?.find(x => x.id === id).name || null;
  }

  updateMedicineList() {
    this.updateAllergyList();
  }

  updateAllergyList() {
    if (this.medicineList) {
      this.allergyList = this.medicineList.filter(x => !this.patient.allergy.includes(x.id));
    }
  }

  get addAllergy() {
    return (id: number) => {
      this.patient.allergy.push(id);
      this.updateAllergyList();
    };
  }

  get removeAllergy() {
    return (id: number) => {
      const index = this.patient.allergy.indexOf(id);
      if (index > -1) {
        this.patient.allergy.splice(index, 1);
        this.updateAllergyList();
      }
    };
  }

  sortUser(a: User, b: User): number {
    const nameA = (a.lastName ?? '') + (a.firstName ?? '') + a.userName;
    const nameB = (b.lastName ?? '') + (b.firstName ?? '') + b.userName;

    return nameA.localeCompare(nameB);
  }

  selectStatus() {
    if (this.patient.dialysisInfo.status) {
      const tmp = this.statusList.value.find(x => x.name === this.patient.dialysisInfo.status);
      this.status = tmp.category;
      if (this.status !== StatusCategories.Transferred) {
        this.patient.dialysisInfo.transferTo = null;
      }
      if (this.status !== StatusCategories.Deceased) {
        this.patient.dialysisInfo.timeOfDeath = null;
        this.patient.dialysisInfo.causeOfDeath = null;
      }
    }
    else {
      this.status = null;
      this.patient.dialysisInfo.transferTo = null;
      this.patient.dialysisInfo.timeOfDeath = null;
      this.patient.dialysisInfo.causeOfDeath = null;
    }
  }

  async editTag(tag?: Tag) {
    const tagEdit = await this.modal.create({
      component: TagDetailComponent,
      cssClass: 'tag-modal',
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        data: tag,
        callback: (data: Tag) => {
          if (!tag) {
            this.patient.tags.push(data);
          }
        },
        onDelete: () => {
          if (tag) {
            const n = this.patient.tags.indexOf(tag);
            this.patient.tags.splice(n);
          }
        }
      }
    });
    tagEdit.present();
  }

  async updateIdentity(ev?) {
    console.log('mask: ', ev);
    if (ev) {
      // update model value
      this.identityNg.control.setValue(ev.unmasked);
      // setTimeout(() => {
      //   console.log('model', this.patient.identityNo);
      //   console.log('input', this.identityNoEl.value);
      // });
    }
    else {
      // change identity type
      setTimeout(() => {
        const unmasked = this.identityMask.unmaskedValue(this.patient.identityNo);
        this.identityNg.control.setValue(unmasked);

        // console.log('model', this.patient.identityNo);
        // console.log('input', this.identityNoEl.value);
      });
    }
  }

  async save() {
    if (this.useHN) {
      this.patient.id = this.patient.hospitalNumber;
    }

    if (this.editMode && this.currentId !== this.patient.id) {
      const countInfo = await this.hemoService.countRecords(this.currentId);
      if (countInfo.total > 1) {
        const warning = await this.alertCtl.create({
          header: 'Warning: modified ID',
          subHeader: 'Potential undesirable',
          message: 'You are modifying the patient ID.<br><br>This might cause a heavy work load on server and database.' +
                  '(Since all the patient\'s hemosheet(s) and some other data will be auto-updated along side this. The more data the heavier the work load.)' +
                  '<br><br>Some data may also be broken and need manual repair.<br><br>Are you sure you want to proceed?',
          buttons: [
            { text: 'Abort' },
            {
              text: 'Confirm',
              role: 'ok'
            }
          ]
        });
        warning.present();
        const result = await warning.onWillDismiss();
        if (result.role !== 'ok') {
          return;
        }
      }
    }
    if (this.editMode && this.patient.unitId !== this.currentUnit) {
      const warning = await this.alertCtl.create({
        header: 'Warning: Unit Transfer',
        subHeader: 'Schedule will be reset',
        message: 'You are modifying the patient unit.<br><br>This patient will be transferred to new unit.' +
                'This means that any existing schedule(s) for this patient will be auto-reset and erased.<br><br>Are you sure you want to proceed?',
        buttons: [
          { text: 'Abort' },
          {
            text: 'Confirm',
            role: 'ok'
          }
        ]
      });
      warning.present();
      const result = await warning.onWillDismiss();
      if (result.role !== 'ok') {
        return;
      }
    }

    const saveToServer$ = this.editMode ?
      this.patientService.updatePatient(this.currentId, this.patient) :
      this.patientService.addPatient(this.patient);
    await addOrEdit(this.injector, {
      addOrEditCall: saveToServer$,
      successTxt: { name: 'Patient', editMode: this.editMode},
      redirectRoute: ['/patients', this.patient.id],
      content: this.content,
      successCallback: () => {
        this.patientService.setTmp(this.patient);
        this.currentId = this.patient.id;
      },
      errorCallback: err => this.error = err,
      completeCallback: () => this.error = null
    });
  }

  async deletePatient() {
    const alert = await this.alertCtl.create({
      backdropDismiss: true,
      header: 'Delete warning!',
      message: 'This cannot be undone, are you sure you want to delete this patient data?',
      subHeader: `patient: ${this.patient.name} (${this.patient.id})`,
      buttons: [
        {
          text: 'Confirm',
          handler: () => this.patientService.deletePatient(this.currentId)
            .subscribe({
              next: () => {
                presentToast(this.injector, {
                  header: 'Deleted',
                  type: ToastType.alert,
                  message: `Patient id ${this.currentId} has been deleted.`
                });
              }
            }),
            role: 'OK'
        },
        {
          text: 'Cancel'
        }
      ]
    });

    alert.present();
  }

  async importHis() {
    const hnSelect = await this.popup.create({
      component: PopupStringInputComponent,
      componentProps: {
        title: 'Patient From HIS',
        placeholder: 'Please enter patient\'s HN'
      },
      backdropDismiss: true,
      cssClass: 'hemo-popup'
    });
    hnSelect.present();
    const result = await hnSelect.onWillDismiss();
    if (result.role !== 'ok' || !result.data) {
      return;
    }

    const hn = result.data;

    const loading = await this.loadCtl.create();
    loading.present();
    this.his.getPatientByHN(hn)
      .pipe(finalize(() => loading.dismiss()))
      .subscribe(data => {
        console.log(data);
        Object.assign(this.patient, ...Object.keys(data).filter(k => data[k] != null).map(k => {
          const result = {};
          result[k] = data[k];
          return result;
        }) );
    });
  }

}
