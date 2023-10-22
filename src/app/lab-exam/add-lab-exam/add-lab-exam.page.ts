import { IonContent, NavParams, Platform } from '@ionic/angular';
import { LabService } from './../lab.service';
import { MasterdataService } from './../../masterdata/masterdata.service';
import { PatientInfo } from './../../patients/patient-info';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { CreateLabExam } from '../lab-exam';
import { ToastType, addOrEdit, onLeavePage, presentToast } from 'src/app/utils';
import { LabItemInfo } from 'src/app/masterdata/labItem';
import { AppConfig } from 'src/app/app.config';
import { formatLocalDateString } from 'src/app/utils-with-date';

@Component({
  selector: 'app-add-lab-exam',
  templateUrl: './add-lab-exam.page.html',
  styleUrls: ['./add-lab-exam.page.scss'],
})
export class AddLabExamPage implements OnInit {
  @Input() patient: PatientInfo

  labItemList: LabItemInfo[];
  labItems: LabItemInfo[];

  entryTime: Date;
  entryItems: CreateLabExam[] = [];

  max: string;
  error: string;

  @ViewChild(IonContent) content: IonContent;

  constructor(private master: MasterdataService, private injector: Injector, private params: NavParams, private labService: LabService, private plt: Platform) { }

  ngOnInit() {
    this.master.getLabItemList().subscribe(data => {
      this.labItemList = data;
      this.labItems = this.labItemList;
    });

    this.max = formatLocalDateString(new Date());
    
    this.add();
  }

  get isSmall() { return this.plt.width() <= 575 || this.plt.height() <= 400; }

  trackBy(item: CreateLabExam) {
    return item.labItemId;
  }
  
  toggleValue(item: CreateLabExam) {
    item.labValue = item.labValue ? 0 : 1;
  }

  getInfo(item: CreateLabExam) {
    return this.labItemList?.find(x => x.id === item.labItemId);
  }

  updateItemList() {
    if (this.labItemList) {
      this.labItems = this.labItemList.filter(x => !this.entryItems.map(x => x.labItemId).includes(x.id));
    }
  }
  
  add() {
    this.entryItems.push({ labItemId: null, labValue: null });
  }

  defaultList() {
    const list = AppConfig.config.labExam?.defaultList ?? [];
    if (list.length === 0) {
      presentToast(this.injector, { 
        header: 'No Default Labs',
        message: 'No default labs list. Please let admin set it in setting.',
        native: true,
        type: ToastType.alert });
      return;
    }

    this.entryItems = [];
    list.forEach(id => {
      this.entryItems.push({ labItemId: id, labValue: null });
    });
  }

  async save() {
    const callToServer$ = this.labService.addLabExam(this.patient, this.entryTime, this.entryItems);
    await addOrEdit(this.injector, {
      addOrEditCall: callToServer$,
      successTxt: 'Lab Exam(s) has been saved',
      content: this.content,
      errorCallback: err => {
        this.error = err;
      },
      isModal: true,
      successCallback: (data) => {
        this.labService.setTmp(data);
      },
      completeCallback: () => this.error = null
    });
  }

  ionViewWillLeave() {
    onLeavePage(null, this.params);
  }

}
