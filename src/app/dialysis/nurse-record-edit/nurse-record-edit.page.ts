import { GUID } from 'src/app/share/guid';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonNav, ModalController, NavParams, Platform } from '@ionic/angular';
import { formatISO } from 'date-fns';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Permissions } from 'src/app/enums/Permissions';
import { addOrEdit, ModalBack, onLeavePage } from 'src/app/utils';
import { NurseRecord, NurseRecordInfo } from '../nurse-record';
import { RecordService } from '../record.service';

@Component({
  selector: 'app-nurse-record-edit',
  templateUrl: './nurse-record-edit.page.html',
  styleUrls: ['./nurse-record-edit.page.scss'],
})
export class NurseRecordEditPage implements OnInit {
  @Input() hemoId: GUID;
  @Input() isModal: boolean;
  @Input() record: NurseRecordInfo;

  @Input() deleteFunc: (item: NurseRecordInfo) => Promise<boolean>;

  editMode: boolean;
  canDelete: boolean;
  canEdit: boolean = true;
  
  maxDate: string;
  error: string;

  get width() { return this.plt.width(); }
  @ViewChild(IonContent) content: IonContent;

  constructor(private plt: Platform, 
    private auth: AuthService,
    private recordService: RecordService,
    private params: NavParams,
    private injector: Injector) { }

  ngOnInit() {
    if (!this.record) {
      this.record = new NurseRecord;
      this.record.hemodialysisId = this.hemoId;
    }
    else {
      this.editMode = true;
      // for reverse back (cancel case)
      this.recordService.setTmp(Object.assign(new NurseRecord, this.record));
    }

    const date = new Date();
    this.maxDate = formatISO(date);

    this.canDelete = this.auth.currentUser.checkPermissionLevel(Permissions.HeadNurseOnly);
    this.canEdit = this.auth.currentUser.checkPermissionLevel(Permissions.NurseOnly);
  }

  ionViewWillLeave() {
    onLeavePage(null, this.params);
  }

  async save() {

    const saveToServer$: Observable<any> = this.editMode ? 
      this.recordService.updateNurseRecord(this.record) : 
      this.recordService.createNurseRecord(this.record).pipe(map(x => Object.assign(new NurseRecord, x)));

    await addOrEdit(this.injector, {
      addOrEditCall: saveToServer$,
      successTxt: { name: 'Nurse Record', editMode: this.editMode},
      content: this.content,
      errorCallback: err => this.error = err,
      isModal: this.isModal,
      successCallback: data => {
        if (!this.editMode) {
          // Add new one to the list
          this.recordService.setTmp(data)
        }
        else {
          // no need to reverse back if update successfully
          this.recordService.setTmp(null);
        }
      },
      completeCallback: () => this.error = null
    });
  }

  async delete() {
    const result = await this.deleteFunc(this.record);
    if (result) {
      const nav = this.injector.get(IonNav);
      const modal = this.injector.get(ModalController);
      ModalBack(nav, this.params, modal);
    }
  }

}
