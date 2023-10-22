import { PatientHistorySettingPage } from './masterdata-setting/patient-history-setting/patient-history-setting.page';
import { Component, Input, OnInit } from '@angular/core';
import { IonNav, ModalController, NavController, Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { LanguageService } from '../share/service/language.service';
import { AppSettingPage } from './app-setting/app-setting.page';
import { AssessmentSettingPage } from './assessment-setting/assessment-setting.page';
import { BasicSettingPage } from './basic-setting/basic-setting.page';
import { DialysisRecordSettingPage } from './dialysis-record-setting/dialysis-record-setting.page';
import { HemosheetSettingPage } from './hemosheet-setting/hemosheet-setting.page';
import { LanguageSettingPage } from './language-setting/language-setting.page';
import { AnticoagulantSettingPage } from './masterdata-setting/anticoagulant-setting/anticoagulant-setting.page';
import { DeathCauseSettingPage } from './masterdata-setting/death-cause-setting/death-cause-setting.page';
import { DialysateSettingPage } from './masterdata-setting/dialysate-setting/dialysate-setting.page';
import { DialyzerSettingPage } from './masterdata-setting/dialyzer-setting/dialyzer-setting.page';
import { LabItemSettingPage } from './masterdata-setting/lab-item-setting/lab-item-setting.page';
import { MedicineSettingPage } from './masterdata-setting/medicine-setting/medicine-setting.page';
import { NeedleSettingPage } from './masterdata-setting/needle-setting/needle-setting.page';
import { StatusSettingPage } from './masterdata-setting/status-setting/status-setting.page';
import { UnderlyingSettingPage } from './masterdata-setting/underlying-setting/underlying-setting.page';
import { UnitSettingPage } from './masterdata-setting/unit-setting/unit-setting.page';
import { NotificationSettingPage } from './notification-setting/notification-setting.page';
import { PatientSettingPage } from './patient-setting/patient-setting.page';
import { PrescriptionSettingPage } from './prescription-setting/prescription-setting.page';
import { ShiftHistorySettingPage } from './shift-history-setting/shift-history-setting.page';
import { UserSettingPage } from './user-setting/user-setting.page';
import { WardSettingPage } from './masterdata-setting/ward-setting/ward-setting.page';
import { ScheduleSettingPage } from './schedule-setting/schedule-setting.page';
import { MedSupplySettingPage } from './masterdata-setting/med-supply-setting/med-supply-setting.page';
import { EquipmentSettingPage } from './masterdata-setting/equipment-setting/equipment-setting.page';
import { RoleSettingPage } from './role-setting/role-setting.page';
import { LabExamSettingPage } from './lab-exam-setting/lab-exam-setting.page';

@Component({
  selector: 'app-admin',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  @Input('isModal') isModal;

  isAdmin: boolean;
  isPowerAdmin: boolean;
  isMobileApp: boolean;

  hasUserPermission: boolean;
  hasBasicPermission: boolean;
  hasShiftHistoryPermission: boolean;
  hasStockPermission: boolean;
  hasAdvancePermission: boolean;

  isDebug: boolean;

  get Lang() { return this.lang.CurrentLanguage }

  constructor(
    private ionNav: IonNav,
    private auth: AuthService,
    private plt: Platform,
    private navCtl: NavController,
    private modalCtl: ModalController,
    private lang: LanguageService)
  {
    this.isAdmin = this.auth.currentUser.isAdmin;
    this.isPowerAdmin = this.auth.currentUser.isPowerAdmin || auth.currentUser.hasGlobalPermission();
    this.isMobileApp = this.plt.is('capacitor');
    this.hasUserPermission = auth.currentUser.checkPermission('user', 'user-add', 'user-edit', 'user-del');
    this.hasBasicPermission = auth.currentUser.checkPermission('basic');
    this.hasShiftHistoryPermission = auth.currentUser.checkPermission('shift-history');
    this.hasStockPermission = auth.currentUser.checkPermission('medicine', 'medicine-category', 'med-supply', 'equipment', 'dialyzer');
    this.hasAdvancePermission = auth.currentUser.checkPermission('assessment', 'hemosheet-setting', 'hemosheet-rule',
      'schedule', 'dialysis-record', 'prescription', 'patient-setting', 'lab-exam');
  }

  ngOnInit() {
    this.isDebug = !environment.production;
  }

  close() {
    if (this.isModal) {
      this.modalCtl.dismiss();
    }
  }

  appPrefSetting() {
    this.ionNav.push(AppSettingPage);
  }

  showBasicSetting() {
    this.ionNav.push(BasicSettingPage);
  }

  showLanguageSetting() {
    this.ionNav.push(LanguageSettingPage);
  }

  showUserSetting() {
    this.ionNav.push(UserSettingPage);
  }

  showRoleSetting() {
    this.ionNav.push(RoleSettingPage);
  }

  showUnitSetting() {
    this.ionNav.push(UnitSettingPage);
  }

  showMedicineSetting() {
    this.ionNav.push(MedicineSettingPage);
  }

  showStatusSetting() {
    this.ionNav.push(StatusSettingPage);
  }

  showDeathCauseSetting() {
    this.ionNav.push(DeathCauseSettingPage);
  }

  showACSetting() {
    this.ionNav.push(AnticoagulantSettingPage);
  }

  showNeedleSetting() {
    this.ionNav.push(NeedleSettingPage);
  }

  showDialysateSetting() {
    this.ionNav.push(DialysateSettingPage);
  }

  showDialyzerSetting() {
    this.ionNav.push(DialyzerSettingPage);
  }

  showAssessment() {
    this.ionNav.push(AssessmentSettingPage);
  }

  showDialysisRecord() {
    this.ionNav.push(DialysisRecordSettingPage);
  }

  showUnderlyingSetting() {
    this.ionNav.push(UnderlyingSettingPage);
  }

  showLabItemSetting() {
    this.ionNav.push(LabItemSettingPage);
  }

  showLabExamSetting() {
    this.ionNav.push(LabExamSettingPage);
  }

  showHemosheet() {
    this.ionNav.push(HemosheetSettingPage);
  }

  showSchedule() {
    this.ionNav.push(ScheduleSettingPage);
  }

  showShiftHistory() {
    this.ionNav.push(ShiftHistorySettingPage);
  }

  showPatient() {
    this.ionNav.push(PatientSettingPage);
  }

  showPrescription() {
    this.ionNav.push(PrescriptionSettingPage);
  }

  showWardSetting() {
    this.ionNav.push(WardSettingPage);
  }

  showMedSupplySetting() {
    this.ionNav.push(MedSupplySettingPage);
  }

  showEquipmentSetting() {
    this.ionNav.push(EquipmentSettingPage);
  }

  showPatientHistorySetting() {
    this.ionNav.push(PatientHistorySettingPage);
  }

  gotoProfile() {
    this.modalCtl.dismiss();
    this.navCtl.navigateForward('/profile');
  }

  gotoNotiSetting() {
    this.ionNav.push(NotificationSettingPage);
  }

}
