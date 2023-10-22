import { finalize, first } from 'rxjs/operators';
import { AssessmentGroupInfo } from './../../assessment';
import { AuthService } from './../../../auth/auth.service';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, combineLatest, Observable, forkJoin, firstValueFrom } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { AssessmentTypes } from 'src/app/enums/assessment-type.enum';
import { OptionTypes } from 'src/app/enums/option-types.enum';
import { addOrEdit } from 'src/app/utils';
import { AssessmentInfo, AssessmentItem } from '../../assessment';
import { AssessmentService } from '../../assessment.service';
import { HemosheetInfo } from '../../hemosheet-info';
import { clearItem, customToggle, getData, getLabel, getNumberLabel, getOptionList, getSelectedOption, getTextLabel, hasCustomValue, initAssessmentInfo, isCustom, isOther, isValueType, select, selectOption, textInput, toggleCheck, trackOption, valueInput } from '../../assessment.util';

@Component({
  selector: 'hemo-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss'],
})
export class AssessmentComponent implements OnInit, AfterViewInit {
  @Input() hemosheet: HemosheetInfo;
  @Input() assessments: Observable<AssessmentInfo[]>;
  @Input() assessmentGroups: Observable<AssessmentGroupInfo[]>;
  @Input() items: AssessmentItem[];
  @Output() itemsChange: EventEmitter<AssessmentItem[]> = new EventEmitter<AssessmentItem[]>();

  @Input() isModal: boolean;

  @Input() clearEvent: EventEmitter<any>;

  reassessment: boolean;
  clearMode: boolean;

  viewOnly: boolean;

  preGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);
  postGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);
  otherGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);

  preAssessments: BehaviorSubject<AssessmentInfo[]> = new BehaviorSubject<AssessmentInfo[]>(null);
  postAssessments: BehaviorSubject<AssessmentInfo[]> = new BehaviorSubject<AssessmentInfo[]>(null);
  otherAssessments: BehaviorSubject<AssessmentInfo[]> = new BehaviorSubject<AssessmentInfo[]>(null);
  types = OptionTypes;

  get width() { return this.plt.width(); }

  isLoaded: boolean = false;

  @ViewChild('other', { read: ViewContainerRef }) otherContainer: ViewContainerRef;
  @ViewChild('pre', { read: ViewContainerRef }) preContainer: ViewContainerRef;
  @ViewChild('post', { read: ViewContainerRef }) postContainer: ViewContainerRef;
  @ViewChild('re', { read: ViewContainerRef }) reContainer: ViewContainerRef;
  @ViewChild('assessment', { read: TemplateRef }) assessT: TemplateRef<any>;
  @ViewChild('groupHeader', { read: TemplateRef }) groupT: TemplateRef<any>;

  constructor(
    private assessmentService: AssessmentService,
    private auth: AuthService,
    private injector: Injector,
    private plt: Platform,
    private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.reassessment = AppConfig.config.hasReassessment;
    this.viewOnly = this.auth.currentUser.isPN && !this.auth.currentUser.isAdmin && !this.auth.currentUser.isPowerAdmin;

    combineLatest([this.assessments, this.assessmentGroups, this.items]).pipe(first(([a, g]) => !!a && !!g))
    .subscribe(([assessments, groups]) => {
      if (!assessments) {
        console.log('no assessment');
        return;
      }
      
      assessments = initAssessmentInfo(assessments, this.items);
      
      setTimeout(() => {
        this.preAssessments.next(assessments.filter(x => x.type === AssessmentTypes.Pre));
        this.postAssessments.next(assessments.filter(x => x.type === AssessmentTypes.Post));
        this.otherAssessments.next(assessments.filter(x => x.type === AssessmentTypes.Other));
        this.preGroups.next(groups.filter(x => x.type === AssessmentTypes.Pre));
        this.postGroups.next(groups.filter(x => x.type === AssessmentTypes.Post));
        this.otherGroups.next(groups.filter(x => x.type === AssessmentTypes.Other));
        this.isLoaded = true;
        setTimeout(() => {
          this.render();
        });
      });
    });

    if (this.clearEvent) {
      this.clearEvent.subscribe(() => this.clearMode = !this.clearMode);
    }

  }

  ngAfterViewInit(): void {
  }

  rerender() {
    console.log('re-render');
    // silly bug warning: check the view (html) if any container has a chance to be null
    this.otherContainer?.clear(); // this can be null
    this.preContainer?.clear(); // just in case
    this.reContainer?.clear(); // this can be null
    this.postContainer?.clear(); // just in case
    this.render();
  }

  render() {
    
    const others = this.otherAssessments.value.filter(x => !x.groupId);
    for (const element of others) {
      const item = element
      this.otherContainer.createEmbeddedView(this.assessT, { list: this.items, item, reassessment: false, clearMode: () => this.clearMode });
    }
    const otherGroups = this.otherGroups.value;
    for (const element of otherGroups) {
      const group = element;
      const items = this.otherAssessments.value.filter(x => x.groupId === group.id);
      if (items.length > 0) {
        this.otherContainer.createEmbeddedView(this.groupT, { name: group.displayName });
        for (const element of items) {
          const item = element;
          this.otherContainer.createEmbeddedView(this.assessT, { list: this.items, item, reassessment: false, clearMode: () => this.clearMode });
        }
      }
    }
    
    const pre = this.preAssessments.value.filter(x => !x.groupId);
    for (const element of pre) {
      const item = element;
      this.preContainer.createEmbeddedView(this.assessT, { list: this.items, item, reassessment: false, clearMode: () => this.clearMode });
      if (this.reassessment) {
        this.reContainer.createEmbeddedView(this.assessT, { list: this.items, item, reassessment: true, clearMode: () => this.clearMode });
      }
    }
    
    const preGroups = this.preGroups.value;
    for (const element of preGroups) {
      const group = element;
      const items = this.preAssessments.value.filter(x => x.groupId === group.id);
      if (items.length > 0) {
        this.preContainer.createEmbeddedView(this.groupT, { name: group.displayName });
        for (const element of items) {
          const item = element;
          this.preContainer.createEmbeddedView(this.assessT, { list: this.items, item, reassessment: false, clearMode: () => this.clearMode });
        }
        if (this.reassessment) {
          this.reContainer.createEmbeddedView(this.groupT, { name: group.displayName });
          for (const element of items) {
            const item = element;
            this.reContainer.createEmbeddedView(this.assessT, { list: this.items, item, reassessment: true, clearMode: () => this.clearMode });
          }
        }
      }
    }
    
    const post = this.postAssessments.value.filter(x => !x.groupId);
    for (const element of post) {
      const item = element;
      this.postContainer.createEmbeddedView(this.assessT, { list: this.items, item, reassessment: false, clearMode: () => this.clearMode });
    }
    const postGroups = this.postGroups.value;
    for (const element of postGroups) {
      const group = element;
      const items = this.postAssessments.value.filter(x => x.groupId === group.id);
      if (items.length > 0) {
        this.postContainer.createEmbeddedView(this.groupT, { name: group.displayName });
        for (const element of items) {
          const item = element;
          this.postContainer.createEmbeddedView(this.assessT, { list: this.items, item, reassessment: false, clearMode: () => this.clearMode });
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
    clearItem(data, {
      assessmentService: this.assessmentService,
      items: this.items,
      itemsChange: this.itemsChange,
      injector: this.injector,
      cdr: this.cdr
    });
  }

  async save(type?: string) {
    await this.fixDuplicatedAssessmentItems();
    let itemList: AssessmentItem[];
    let info: AssessmentInfo[];
    if (type === 'pre') {
      itemList = this.items.filter(x => this.preAssessments.value.map(a => a.id).includes(x.assessmentId) && !x.isReassessment);
      info = this.preAssessments.value;
    }
    else if (type === 're') {
      itemList = this.items.filter(x => this.preAssessments.value.map(a => a.id).includes(x.assessmentId) && x.isReassessment);
      info = this.preAssessments.value;
    }
    else if (type === 'post') {
      itemList = this.items.filter(x => this.postAssessments.value.map(a => a.id).includes(x.assessmentId));
      info = this.postAssessments.value;
    }
    else if (type === 'other') {
      itemList = this.items.filter(x => this.otherAssessments.value.map(a => a.id).includes(x.assessmentId));
      info = this.otherAssessments.value;
    }

    // filter out empty data
    itemList = itemList!.filter(x => x.checked !== undefined || (x.selected?.length??0) > 0 || x.text || x.value);

    if (itemList!.length === 0) {
      return;
    }

    // clear text for unchecked:
    itemList.forEach(x => {
      const assessment = info.find(n => n.id === x.assessmentId);
      if (!assessment!.multi && assessment!.optionType === OptionTypes.Checkbox && !x.checked) {
        x.text = null;
        x.value = null;
      }
    });

    addOrEdit(this.injector, {
      addOrEditCall: this.assessmentService.addOrUpdateItems(this.hemosheet, itemList),
      successTxt: 'Assessment record has been updated.',
      successCallback: async (data: AssessmentItem[]) => {
        // re-init item
        const assessments = await firstValueFrom(this.assessments);
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          
          const info = assessments.find(x => x.id === item.assessmentId)!;
          const valueType = this.isValueType(info);
          if (!valueType && item.text && (!item.selected?.includes(0) ?? false)) {
            item.selected!.push(0);
          }

          if (valueType && this.hasCustomValue(item, info)) {
            (data as any).custom = true;
          }
        }

        // update list
        const listMap = data.map(i => i.assessmentId);
        this.items = this.items.filter(x => !listMap.includes(x.assessmentId));
        this.items = this.items.concat(data);

        this.itemsChange.emit(this.items);
        setTimeout(() => {
          this.rerender();
        });
        
      },
      isModal: this.isModal,
      stay: true
    });
  }

  // ====================== Utils ======================

  /**
   * Silently auto-delete any duplicated records on assessment items for this hemosheet.
   * (trade bandwidth for server performance and efficiency)
   * @private
   * @memberof AssessmentComponent
   */
  private async fixDuplicatedAssessmentItems() {
    // grouping
    const tmp = {};
    this.items.forEach(x => {
      const key = x.assessmentId + (x.isReassessment ? '-re' : '');
      if (!tmp[key]) {
        tmp[key] = [];
      }
      if (x.id) {
        tmp[key].push(x);
      }
    });
    console.log(tmp);
    // collecting duplicated records
    const deletes = [] as AssessmentItem[];
    for (const k in tmp) {
      const item = tmp[k] as AssessmentItem[];
      for (let i = 1; i < item.length; i++) {
        const element = item[i];
        deletes.push(element);
      }
    }
    
    const deleteCalls$ = deletes.map(x => this.assessmentService.deleteItem(x));
    console.log('deletes: ', deleteCalls$);

    return new Promise<void>(resolve => {
      forkJoin(deleteCalls$).pipe(finalize(() => resolve())).subscribe({
        next: () => {
          console.log('delete duplicated completed.');
          const ids = deletes.map(x => x.id);
          this.items = this.items.filter(x => !ids.includes(x.id));
          this.itemsChange.emit(this.items);
        },
        error: () => {
          console.log('failed to delete duplicated: ', deleteCalls$);
        }
      });
    });
    
  }

}
