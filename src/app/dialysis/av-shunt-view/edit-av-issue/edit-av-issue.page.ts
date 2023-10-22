import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { IonContent, IonSelect, Platform } from '@ionic/angular';
import { formatISO } from 'date-fns';
import { BehaviorSubject } from 'rxjs';
import { addOrEdit } from 'src/app/utils';
import { AvShunt } from '../../av-shunt';
import { AvShuntIssueTreatment } from '../../av-shunt-issue-treatment';
import { AvShuntService } from '../../av-shunt.service';
import { EditAvShuntPage } from '../edit-av-shunt/edit-av-shunt.page';

@Component({
  selector: 'app-edit-av-issue',
  templateUrl: './edit-av-issue.page.html',
  styleUrls: ['./edit-av-issue.page.scss'],
})
export class EditAvIssuePage implements OnInit {

  constructor(private plt: Platform, private avService: AvShuntService, private injector: Injector, private cdr: ChangeDetectorRef) { }

  get width() {
    return this.plt.width();
  }
  get avProps() { return { patientId: this.dataTmp.patientId }; }
  get avAdded() { return () => {
    this.loadAvShuntList();
    const data: AvShunt = this.avService.getTmp();
    this.onAddNewShunt.emit(data);
  };}
  @Input() patientId: string;
  @Input() issue: AvShuntIssueTreatment;
  @Output() onAddNewShunt: EventEmitter<AvShunt> = new EventEmitter<AvShunt>();
  dataTmp: AvShuntIssueTreatment;
  editMode: boolean;

  deleted: boolean;
  maxDate: string;

  error: string;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('form') form: NgForm;
  @ViewChild('avSelect') avSelect: IonSelect;

  cathList: BehaviorSubject<AvShunt[]> = new BehaviorSubject<AvShunt[]>(null);
  deletedAvShunts: AvShunt[];

  complicationList = [
    'Needle tube coagulation',
    'Catheter outlet exudate',
    'Insufficient Blood Flow',
    'Prolong Bleeding Time',
    'Palm/Arm/Finger swell/pain/numb/cold',
    'Abnormal Bruit (Weakening/Discontinued/Change in Tune)',
    '3 consecutive unusual increase of Venouse pressure',
    'Change of fistula appearance (detailed explanation)',
    'Insufficient KT/V or URR',
    'Path solidification',
    'Infection (bacteria)',
    'Catheter shedding',
    'Puncture difficulty',
    'Other'
  ];
  treatmentMethodList = [
    'Recycle rate detection (result)',
    'Medical therapy removal of thrombus (explain)',
    'Surgical removal of thrombus',
    'Fistula or blood photography',
    'Angioplasty (PTA)',
    'Surgical correction',
    'New vascular access reconstruction',
    'Provide antibiotics (Type and path)',
    'Other (explain)'
  ];
  component: {};

  avPage = EditAvShuntPage;

  ngOnInit() {
    if (!this.issue) {
      this.editMode = false;
      this.dataTmp = { type: 'avIssue', patientId: this.patientId, isActive: true };
    }
    else {
      this.editMode = true;
      this.dataTmp = Object.assign({}, this.issue);

      if (!this.issue.isActive) {
        this.deleted = true;
      }
    }
    const date = new Date();
    this.maxDate = formatISO(date);
    this.loadAvShuntList();
  }

  loadAvShuntList() {
    this.avService.getAvShuntList(this.dataTmp.patientId)
    .subscribe(data => {
      this.cathList.next(data.filter(x => x.isActive));
      this.deletedAvShunts = data.filter(x => !x.isActive);
      this.initAvShunt();
    });
  }

  getAVShuntName(item: AvShunt) {
    if (!item) {
      return null;
    }
    return this.avService.getAvShuntSiteName(item);
  }

  avUpdate() {
    if (this.dataTmp.cathId) {
      this.resetAvShuntDisplay();
    }
  }

  initAvShunt() {
    if (this.dataTmp.cathId && !this.cathList.value.find(x => x.id === this.dataTmp.cathId)) {
      this.stuffAvShuntDisplay();
    }
    else {
      this.resetAvShuntDisplay();
    }
  }

  private stuffAvShuntDisplay() {
    this.avSelect.selectedText = this.getAVShuntName(this.deletedAvShunts.find(x => x.id === this.dataTmp.cathId));
  }

  private resetAvShuntDisplay() {
    if (this.avSelect.selectedText) {
      this.avSelect.selectedText = null;
    }
  }

  async save() {
    const save$ = !this.editMode ?
      this.avService.createAvIssue(this.dataTmp)
      : this.avService.editAvIssue(this.dataTmp);

    await addOrEdit(this.injector, {
      addOrEditCall: save$,
      successTxt: { name: 'AV Issue', editMode: this.editMode},
      content: this.content,
      errorCallback: err => this.error = err,
      isModal: true,
      successCallback: data => {
        if (!this.editMode) {
          // Add new one to the list
          data.type = 'avIssue';
          this.avService.setTmp(data);
        }
        else {
          this.avService.setTmp(this.dataTmp);
        }
      },
      completeCallback: () => this.error = null
    });
  }

}
