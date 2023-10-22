import { GUID } from 'src/app/share/guid';
import { ChangeDetectorRef, Component, Injector, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { IonContent, IonNav, ModalController, NavParams, Platform } from '@ionic/angular';
import { formatISO } from 'date-fns';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { AuthService } from 'src/app/auth/auth.service';
import { Permissions } from 'src/app/enums/Permissions';
import { DialysisRecordSetting } from 'src/app/IAppConfig';
import { addOrEdit, decimalPattern, ModalBack, onLeavePage } from 'src/app/utils';
import { DialysisRecord, DialysisRecordInfo } from '../dialysis-record';
import { RecordService } from '../record.service';
import { AssessmentInfo, AssessmentGroupInfo, AssessmentItem } from '../assessment';
import { AssessmentTypes } from '../../enums/assessment-type.enum';
import { clearItem, customToggle, getData, getLabel, getNumberLabel, getOptionList, getSelectedOption, getTextLabel, hasCustomValue, initAssessmentInfo, isCustom, isOther, isValueType, select, selectOption, textInput, toggleCheck, trackOption, valueInput } from '../assessment.util';
import { OptionTypes } from 'src/app/enums/option-types.enum';

@Component({
  selector: 'app-dialysis-record-edit',
  templateUrl: './dialysis-record-edit.page.html',
  styleUrls: ['./dialysis-record-edit.page.scss'],
})
export class DialysisRecordEditPage implements OnInit {
  clearMode: boolean;

  get width() { return this.plt.width(); }

  get decimalPattern() {
    return decimalPattern();
  }

  constructor(private plt: Platform,
              private auth: AuthService,
              private recordService: RecordService,
              private params: NavParams,
              private cdr: ChangeDetectorRef,
              private injector: Injector) { }

  get Hour() {
    if (this.h === undefined && this.tmp.remaining) {
      this.h = Math.trunc(this.tmp.remaining / 60);
    }

    return this.h;
  }

  set Hour(h: number) {
    this.h = h;
  }
  get Minute() {
    if (this.m === undefined && this.tmp.remaining) {
      this.m = this.tmp.remaining % 60;
    }
    return this.m;
  }

  set Minute(m: number) {
    this.m = m;
  }

  @Input() hemoId: GUID;
  @Input() isModal: boolean;
  @Input() record: DialysisRecordInfo;

  @Input() assessments: Observable<AssessmentInfo[]>;
  @Input() assessmentGroups: Observable<AssessmentGroupInfo[]>;
  hasAssessment = true;

  @Input() isHD: boolean;
  tmp: DialysisRecordInfo;

  dialysisAssessments: BehaviorSubject<AssessmentInfo[]> = new BehaviorSubject<AssessmentInfo[]>(null);
  dialysisGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);

  @Input() deleteFunc: (item: DialysisRecordInfo) => Promise<boolean>;

  editMode: boolean;
  copyToNurse: boolean;

  canDelete: boolean;
  viewOnly: boolean;

  types = OptionTypes;

  maxDate: string;
  // hiding list
  setting: DialysisRecordSetting = AppConfig.config.dialysisRecord;
  error: string;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('dialysis', { read: ViewContainerRef }) dialysisContainer: ViewContainerRef;
  @ViewChild('assessment', { read: TemplateRef }) assessT: TemplateRef<any>;
  @ViewChild('groupHeader', { read: TemplateRef }) groupT: TemplateRef<any>;

  private h: number;
  private m: number;

  ngOnInit() {
    if (!this.record) {
      this.tmp = new DialysisRecord;
      this.tmp.hemodialysisId = this.hemoId;
    }
    else {
      this.tmp = Object.assign(new DialysisRecord, this.record);
      if (this.tmp.id) { // if no id, it is copy mode
        this.editMode = true;

        this.viewOnly = this.tmp.isFromMachine;
      }
      if (!this.tmp.assessmentItems) {
        this.tmp.assessmentItems = [];
      }
    }

    const date = new Date();
    this.maxDate = formatISO(date);
    this.canDelete = this.auth.currentUser.checkPermissionLevel(Permissions.NurseOnly);

    combineLatest([this.assessments, this.assessmentGroups]).pipe(first(([a, g]) => !!a && !!g))
    .subscribe(([assessments, groups]) => {
      if (!assessments || assessments.length === 0) {
        console.log('no assessment');
        this.hasAssessment = false;
        return;
      }
      
      assessments = initAssessmentInfo(assessments, this.tmp.assessmentItems);
      
      setTimeout(() => {
        this.dialysisAssessments.next(assessments.filter(x => x.type === AssessmentTypes.Dialysis));
        this.dialysisGroups.next(groups.filter(x => x.type === AssessmentTypes.Dialysis));
        if (this.dialysisAssessments.value.length === 0) {
          this.hasAssessment = false;
        }
        setTimeout(() => {
          this.render();
        });
      });
    });
  }

  ionViewWillLeave() {
    onLeavePage(null, this.params);
  }

  async save() {

    this.tmp.remaining = this.Hour * 60 + (this.Minute ?? 0);

    console.log('copyToNurse ', this.copyToNurse);

    const saveToServer$: Observable<any> = this.editMode ?
      this.recordService.updateDialysisRecord(this.tmp) :
      this.recordService.createDialysisRecord(this.tmp, this.copyToNurse).pipe(map(x => Object.assign(new DialysisRecord, x)));

    await addOrEdit(this.injector, {
      addOrEditCall: saveToServer$,
      successTxt: { name: 'Dialysis Record', editMode: this.editMode},
      content: this.content,
      errorCallback: err => this.error = err,
      isModal: this.isModal,
      successCallback: data => {
        if (!this.editMode) {
          // Add new one to the list
          this.recordService.setTmp(data);
        }
        else {
          this.recordService.setTmp(this.tmp);
        }
      },
      completeCallback: () => this.error = null
    });
  }

  async delete() {
    const result = await this.deleteFunc(this.tmp);
    if (result) {
      const nav = this.injector.get(IonNav);
      const modal = this.injector.get(ModalController);
      ModalBack(nav, this.params, modal);
    }
  }

  render() {
    const dialysis = this.dialysisAssessments.value.filter(x => !x.groupId);
    for (let i = 0; i < dialysis.length; i++) {
      const item = dialysis[i];
      this.dialysisContainer.createEmbeddedView(this.assessT, { list: this.tmp.assessmentItems, item, clearMode: () => this.clearMode });
    }
    const dialysisGroups = this.dialysisGroups.value;
    for (let g = 0; g < dialysisGroups.length; g++) {
      const group = dialysisGroups[g];
      const items = this.dialysisAssessments.value.filter(x => x.groupId === group.id);
      if (items.length > 0) {
        this.dialysisContainer.createEmbeddedView(this.groupT, { name: group.displayName });
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          this.dialysisContainer.createEmbeddedView(this.assessT, { list: this.tmp.assessmentItems, item, reassessment: false, clearMode: () => this.clearMode });
        }
      }
    }

    this.cdr.detectChanges();
  }

  getData = getData;
  getSelectedOption = getSelectedOption;
  getLabel = getLabel;
  getTextLabel = getTextLabel;
  getNumberLabel = getNumberLabel;
  getOptionList = getOptionList;
  isValueType = isValueType;
  hasCustomValue = hasCustomValue;
  toggleCheck = toggleCheck;
  customToggle = customToggle;
  isCustom = isCustom;
  isOther = isOther;
  select = select;
  selectOption = selectOption;
  textInput = textInput;
  valueInput = valueInput;
  trackOption = trackOption;

  clearItem(data: AssessmentItem) {
    this.record.assessmentItems.splice(this.tmp.assessmentItems.indexOf(data), 1);
  }

}
