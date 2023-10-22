import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { ProgressNote, ProgressNoteInfo } from '../progress-note';
import { GUID, newGuid } from 'src/app/share/guid';
import { IonContent, IonNav, ModalController, NavParams, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { RecordService } from '../record.service';
import { Observable, map } from 'rxjs';
import { onLeavePage, addOrEdit, ModalBack } from 'src/app/utils';
import { Permissions } from 'src/app/enums/Permissions';
import { processProgressNote } from '../progress-note-util';
import { deepCopy } from '../../utils';

@Component({
  selector: 'app-progress-note-edit',
  templateUrl: './progress-note-edit.page.html',
  styleUrls: ['./progress-note-edit.page.scss'],
})
export class ProgressNoteEditPage implements OnInit {

  @Input() hemoId: GUID;
  @Input() isModal: boolean;
  @Input() record: ProgressNoteInfo;

  @Input() total: number;

  @Input() deleteFunc: (item: ProgressNoteInfo) => Promise<boolean>;

  tmp: ProgressNote;

  editMode: boolean;
  canDelete: boolean;
  canEdit: boolean = true;
  
  error: string;

  get width() { return this.plt.width(); }
  @ViewChild(IonContent) content: IonContent;

  constructor(
    private plt: Platform, 
    private auth: AuthService,
    private recordService: RecordService,
    private params: NavParams,
    private injector: Injector) { }

    ngOnInit() {
      if (!this.record) {
        this.tmp = new ProgressNote;
        this.tmp.hemodialysisId = this.hemoId;
      }
      else {
        this.editMode = true;
        
        this.tmp = Object.assign(new ProgressNote, deepCopy(this.record));
      }

      this.tmp.aList.forEach(item => {
        (item as any).tmpId = newGuid();
      });
      this.tmp.iList.forEach(item => {
        (item as any).tmpId = newGuid();
      });
      this.tmp.eList.forEach(item => {
        (item as any).tmpId = newGuid();
      });
      if (this.tmp.aList.length === 0) {
        this.tmp.aList.push({ value: '', tmpId: newGuid() } as any);
      }
      if (this.tmp.iList.length === 0) {
        this.tmp.iList.push({ value: '', tmpId: newGuid() } as any);
      }
      if (this.tmp.eList.length === 0) {
        this.tmp.eList.push({ value: '', tmpId: newGuid() } as any);
      }
      
      this.canEdit = this.auth.currentUser.checkPermissionLevel(Permissions.NurseOnly);
    }
  
    ionViewWillLeave() {
      onLeavePage(null, this.params);
    }
  
    async save() {

      this.tmp.applyData();
      if (!this.editMode) {
        this.tmp.order = this.total;
      }
  
      const saveToServer$: Observable<any> = this.editMode ? 
        this.recordService.updateProgressNote(this.tmp) : 
        this.recordService.createProgressNote(this.tmp);
  
      await addOrEdit(this.injector, {
        addOrEditCall: saveToServer$.pipe(map(processProgressNote)),
        successTxt: { name: 'Progress Note', editMode: this.editMode},
        content: this.content,
        errorCallback: err => this.error = err,
        isModal: this.isModal,
        successCallback: data => {
          this.recordService.setTmp(data);
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

    trackBy(index: number, item: { value: string }) {
      return (item as any).tmpId;
    }

    newGuid=newGuid;

}
