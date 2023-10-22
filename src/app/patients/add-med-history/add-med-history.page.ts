import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { PatientInfo } from '../patient-info';
import { IonContent, IonSelect, NavParams, Platform } from '@ionic/angular';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { MedHistoryService } from '../med-history.service';
import { CreateMedDetail, MedHistoryItemInfo } from '../med-history';
import { addOrEdit, onLeavePage } from 'src/app/utils';
import { Medicine } from 'src/app/masterdata/medicine';

@Component({
  selector: 'app-add-med-history',
  templateUrl: './add-med-history.page.html',
  styleUrls: ['./add-med-history.page.scss'],
})
export class AddMedHistoryPage implements OnInit {
  @Input() patient: PatientInfo

  medList: Medicine[];
  meds: Medicine[];

  entryTime: Date;
  entryItems: CreateMedDetail[] = [];
  
  error: string;

  @ViewChild(IonContent) content: IonContent;

  constructor(private master: MasterdataService, private injector: Injector, private params: NavParams, private medService: MedHistoryService, private plt: Platform) { }

  ngOnInit() {
    this.master.getMedicineList().subscribe(data => {
      this.medList = data;
      this.meds = this.medList;
    });
    
    this.add();
  }

  get isSmall() { return this.plt.width() <= 575 || this.plt.height() <= 400; }

  trackBy(item: CreateMedDetail) {
    return item.medicineId;
  }

  getInfo(item: CreateMedDetail) {
    return this.medList?.find(x => x.id === item.medicineId);
  }

  updateItemList() {
    if (this.medList) {
      this.meds = this.medList.filter(x => !this.entryItems.map(x => x.medicineId).includes(x.id));
    }
  }

  onSelectMed(item: CreateMedDetail, select: IonSelect) {
    this.updateItemList();
    const info = this.getInfo(item);
    const defaultDose = info.dose;
    item.quantity = defaultDose ?? 1;

    select.selectedText = info.name;
  }
  
  add() {
    this.entryItems.push({ entryTime: null, medicineId: null, quantity: null, overrideDose: null, overrideUnit: null });
  }

  getUnit(item: CreateMedDetail) {
    if (!item.medicineId) {
      return null;
    }
    return this.getInfo(item)?.doseUnit;
  }

  getDose(item: CreateMedDetail) {
    if (!item.medicineId) {
      return null;
    }
    return this.getInfo(item)?.dose;
  }

  async save() {
    const callToServer$ = this.medService.addMedDetail(this.patient, this.entryTime, this.entryItems);
    await addOrEdit(this.injector, {
      addOrEditCall: callToServer$,
      successTxt: 'Med History(ies) has been saved',
      content: this.content,
      errorCallback: err => {
        this.error = err;
      },
      isModal: true,
      successCallback: (data) => {
        const newMeds = data as MedHistoryItemInfo[];
        for (let index = 0; index < newMeds.length; index++) {
          const item = newMeds[index];
          item.medicine = this.medList.find(x => x.id === item.medicineId);
        }
        this.medService.setTmp(newMeds);
      },
      completeCallback: () => this.error = null
    });
  }

  ionViewWillLeave() {
    onLeavePage(null, this.params);
  }
}
