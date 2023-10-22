import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { PatientInfo } from '../../patient-info';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../patient.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { PatienHistoryItem } from 'src/app/masterdata/patient-history-item';
import { PatientHistory } from '../../patient-history';
import { addOrEdit, deepCopy } from 'src/app/utils';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-patient-history',
  templateUrl: './patient-history.page.html',
  styleUrls: ['./patient-history.page.scss'],
})
export class PatientHistoryPage implements OnInit {

  patient: PatientInfo;

  historyEntryList: PatienHistoryItem[];
  valueEntry: PatientHistory[];

  editMode: boolean;

  ori: PatientHistory[];
  error: string;

  @ViewChild('content') content: IonContent;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private patientService: PatientService,
    private master: MasterdataService,
    private injector: Injector
    ) { }

  ngOnInit() {
    this.patient = this.activatedRoute.snapshot.data.patient;

    this.master.getPatientHistoryItemList()
      .subscribe(data => this.historyEntryList = data);
    this.patientService.getPatientHistory(this.patient.id)
      .subscribe(data => this.valueEntry = data);

    
  }

  edit() {
    this.editMode = true;
    this.ori = deepCopy(this.valueEntry);

    this.historyEntryList.forEach(entry => {
      if (!this.valueEntry.find(x => x.historyItemId === entry.id)) {
        this.valueEntry.push({ patientId: this.patient.id, historyItemId: entry.id, value: null });
      }
    });
  }

  cancel() {
    this.editMode = false;
    this.valueEntry = deepCopy(this.ori);
  }

  getValue(item: PatienHistoryItem) {
    const entry = this.getValueEntry(item);
    if (entry?.value || entry?.numberValue) {
      if (item.isYesNo) {
        return entry.value.toUpperCase() === 'Y' ? 'Yes' : 'No';
      }
      return entry.numberValue ?? entry.value;
    }
    
    return 'N/A';
  }

  getValueEntry(item: PatienHistoryItem) {
    const entry = this.valueEntry?.find(x => x.historyItemId === item.id);
    return entry;
  }

  getChoice(item: PatienHistoryItem) {
    if (!item.choices || item.choices.length === 0) {
      return [];
    }

    return item.choices.map(x => ({ name: x.text ?? x.numberValue }));
  }

  isInput(item: PatienHistoryItem) {
    return !item.isYesNo && (item.choices?.length === 0 || (item.choices?.length > 0 && item.allowOther));
  }

  isSelect(item: PatienHistoryItem) {
    return !item.isYesNo && item.choices?.length > 0 && !item.allowOther;
  }

  isYesNo(item: PatienHistoryItem) {
    return item.isYesNo;
  }

  toggle(entry: PatientHistory) {
    entry.value = entry.value === 'Y' ? 'N' : 'Y';
  }

  async save() {
    const call$ = this.patientService.updatePatientHistory(this.patient.id, this.valueEntry);

    await addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: 'Update Patient History successfully',
      content: this.content,
      errorCallback: err => this.error = err,
      completeCallback: () => {
        this.editMode = false;
        this.ori = deepCopy(this.valueEntry);
      },
      stay: true
    })
  }

}
