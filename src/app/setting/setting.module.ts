import { PatientHistoryDetailPage } from './masterdata-setting/patient-history-setting/patient-history-detail/patient-history-detail.page';
import { MedicineSettingPageModule } from './masterdata-setting/medicine-setting/medicine-setting.module';
import { UnderlyingSettingPage } from './masterdata-setting/underlying-setting/underlying-setting.page';
import { PrescriptionSettingPage } from './prescription-setting/prescription-setting.page';
import { AssessmentGroupSettingPage } from './assessment-setting/assessment-group-setting/assessment-group-setting.page';
import { PatientSettingPage } from './patient-setting/patient-setting.page';
import { LanguageSettingPage } from './language-setting/language-setting.page';
import { ShiftHistorySettingPage } from './shift-history-setting/shift-history-setting.page';
import { HemosheetSettingPage } from './hemosheet-setting/hemosheet-setting.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingPage } from './setting.page';
import { ShareComponentsModule } from '../share/components/share-components.module';
import { HeaderThemeModule } from '../directive/header-theme.module';
import { UserSettingPage } from './user-setting/user-setting.page';
import { UserDetailPage } from './user-setting/user-detail/user-detail.page';
import { AppPipeModule } from '../pipes/app.pipe.module';
import { UnitSettingPage } from './masterdata-setting/unit-setting/unit-setting.page';
import { DeathCauseSettingPage } from './masterdata-setting/death-cause-setting/death-cause-setting.page';
import { StatusSettingPage } from './masterdata-setting/status-setting/status-setting.page';
import { AnticoagulantSettingPage } from './masterdata-setting/anticoagulant-setting/anticoagulant-setting.page';
import { NeedleSettingPage } from './masterdata-setting/needle-setting/needle-setting.page';
import { DialysateSettingPage } from './masterdata-setting/dialysate-setting/dialysate-setting.page';
import { BasicSettingPage } from './basic-setting/basic-setting.page';
import { AppSettingPage } from './app-setting/app-setting.page';
import { AssessmentSettingPage } from './assessment-setting/assessment-setting.page';
import { AssessmentDetailPage } from './assessment-setting/assessment-detail/assessment-detail.page';
import { AuditNameModule } from '../share/components/audit-name/audit-name.module';
import { DialysisRecordSettingPage } from './dialysis-record-setting/dialysis-record-setting.page';
import { LabItemSettingPage } from './masterdata-setting/lab-item-setting/lab-item-setting.page';
import { LabItemDetailPage } from './masterdata-setting/lab-item-setting/lab-item-detail/lab-item-detail.page';
import { AssessmentGroupDetailPage } from './assessment-setting/assessment-group-detail/assessment-group-detail.page';
import { LabHemosheetSettingPage } from './hemosheet-setting/lab-hemosheet-setting/lab-hemosheet-setting.page';
import { NotificationSettingPage } from './notification-setting/notification-setting.page';
import { WardSettingPage } from './masterdata-setting/ward-setting/ward-setting.page';
import { ScheduleSettingPage } from './schedule-setting/schedule-setting.page';
import { MasterdataListModule } from '../share/components/masterdata-list/masterdata-list.module';
import { DataListModule } from '../share/components/masterdata-list/data-list/data-list.module';
import { RoleSettingPage } from './role-setting/role-setting.page';
import { PermissionEditModule } from './permission-edit/permission-edit.module';
import { RoleDetailPage } from './role-setting/role-detail/role-detail.page';
import { UserPermissionPage } from './user-setting/user-permission/user-permission.page';
import { MedSupplySettingPageModule } from './masterdata-setting/med-supply-setting/med-supply-setting.module';
import { DialyzerSettingPageModule } from './masterdata-setting/dialyzer-setting/dialyzer-setting.module';
import { EquipmentSettingPageModule } from './masterdata-setting/equipment-setting/equipment-setting.module';
import { LabExamSettingPage } from './lab-exam-setting/lab-exam-setting.page';
import { PatientHistorySettingPage } from './masterdata-setting/patient-history-setting/patient-history-setting.page';
import { UnitDetailPage } from './masterdata-setting/unit-setting/unit-detail/unit-detail.page';
import { UnitRuleSettingPage } from './masterdata-setting/unit-setting/unit-rule-setting/unit-rule-setting.page';

@NgModule({
    declarations: [
        SettingPage,
        AppSettingPage,
        BasicSettingPage,
        LanguageSettingPage,
        UserSettingPage,
        UserDetailPage,
        UnitSettingPage,
        UnitDetailPage,
        UnitRuleSettingPage,
        DeathCauseSettingPage,
        StatusSettingPage,
        AnticoagulantSettingPage,
        NeedleSettingPage,
        DialysateSettingPage,
        AssessmentSettingPage,
        AssessmentDetailPage,
        AssessmentGroupSettingPage,
        AssessmentGroupDetailPage,
        DialysisRecordSettingPage,
        LabItemSettingPage,
        LabItemDetailPage,
        LabExamSettingPage,
        HemosheetSettingPage,
        LabHemosheetSettingPage,
        PatientSettingPage,
        PrescriptionSettingPage,
        ShiftHistorySettingPage,
        UnderlyingSettingPage,
        WardSettingPage,
        NotificationSettingPage,
        ScheduleSettingPage,
        RoleSettingPage,
        RoleDetailPage,
        UserPermissionPage,
        PatientHistorySettingPage,
        PatientHistoryDetailPage
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        ShareComponentsModule,
        HeaderThemeModule,
        AppPipeModule,
        AuditNameModule,
        MasterdataListModule,
        DataListModule,
        PermissionEditModule,
        MedSupplySettingPageModule,
        MedicineSettingPageModule,
        DialyzerSettingPageModule,
        EquipmentSettingPageModule
    ]
})
export class SettingPageModule {}
