import { DoctorRecord, DoctorRecordInfo } from './../doctor-record';
import { GUID } from 'src/app/share/guid';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonNav, ModalController, NavParams, Platform } from '@ionic/angular';
import { formatISO } from 'date-fns';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Permissions } from 'src/app/enums/Permissions';
import { addOrEdit, ModalBack, onLeavePage } from 'src/app/utils';
import { RecordService } from '../record.service';

@Component({
  selector: 'app-doctor-record-edit',
  templateUrl: './doctor-record-edit.page.html',
  styleUrls: ['./doctor-record-edit.page.scss'],
})
export class DoctorRecordEditPage implements OnInit {
  @Input() hemoId: GUID;
  @Input() isModal: boolean;
  @Input() record: DoctorRecordInfo;

  @Input() deleteFunc: (item: DoctorRecordInfo) => Promise<boolean>;

  editMode: boolean;
  canEdit: boolean;
  canDelete: boolean;

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
      this.record = new DoctorRecord;
      this.record.hemodialysisId = this.hemoId;
    }
    else {
      this.editMode = true;
      // for reverse back (cancel case)
      this.recordService.setTmp(Object.assign(new DoctorRecord, this.record));
    }

    const date = new Date();
    this.maxDate = formatISO(date);

    this.canEdit = this.auth.currentUser.checkPermissionLevel(Permissions.DoctorOnly);
    this.canDelete = (this.canEdit && this.auth.currentUser.id === this.record.createdBy) || this.auth.currentUser.isAdmin;
  }

  ionViewWillLeave() {
    onLeavePage(null, this.params);
  }

  async save() {

    const saveToServer$: Observable<any> = this.editMode ?
      this.recordService.updateDoctorRecord(this.record) :
      this.recordService.createDoctorRecord(this.record).pipe(map(x => Object.assign(new DoctorRecord, x)));

    await addOrEdit(this.injector, {
      addOrEditCall: saveToServer$,
      successTxt: { name: 'Doctor Record', editMode: this.editMode},
      content: this.content,
      errorCallback: err => this.error = err,
      isModal: this.isModal,
      successCallback: data => {
        if (!this.editMode) {
          // Add new one to the list
          this.recordService.setTmp(data);
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
