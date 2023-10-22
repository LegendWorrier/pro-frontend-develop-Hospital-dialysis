import { GUID, emptyGuid } from 'src/app/share/guid';
import { AdmissionService } from './../admission.service';
import { AuthService } from 'src/app/auth/auth.service';
import { AdmissionInfo, EditAdmission } from './../admission';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Component, Input, OnInit, Injector, ViewChild, ChangeDetectorRef } from '@angular/core';
import { addOrEdit, deepCopy } from 'src/app/utils';
import { Data } from 'src/app/masterdata/data';
import { Status } from 'src/app/masterdata/status';
import { StatusCategories } from 'src/app/enums/status-categories';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { IonContent, Platform, IonNav } from '@ionic/angular';

@Component({
  selector: 'app-edit-admission',
  templateUrl: './edit-admission.page.html',
  styleUrls: ['./edit-admission.page.scss'],
})
export class EditAdmissionPage implements OnInit {

  @Input() patientId: string;
  @Input() admit: AdmissionInfo;

  @Input() fromMain: boolean;

  editMode: boolean;
  tmp: EditAdmission = new EditAdmission();
  status: StatusCategories;

  underlyingList: Data[];
  statusList: BehaviorSubject<Status[]> = new BehaviorSubject<Status[]>(null);

  isAdmin: boolean;
  error: string;
  @ViewChild(IonContent) content: IonContent;

  get width() { return this.plt.width(); }

  constructor(
    private masterdata: MasterdataService,
    private admission: AdmissionService,
    private auth: AuthService,
    private nav: IonNav,
    private plt: Platform,
    private cdr: ChangeDetectorRef,
    private injector: Injector) { }

  ngOnInit() {
    if (!this.admit) {
      this.editMode = false;
    }
    else {
      this.tmp = Object.assign({}, deepCopy(this.admit));
      if (this.tmp.id) {
        this.editMode = true;
      }
    }
    this.tmp.patientId = this.patientId;
    this.tmp.underlyingList = this.tmp.underlying.map(x => x.id);

    this.masterdata.getUnderlyingList().subscribe(data => {
      this.underlyingList = data;
      this.cdr.detectChanges();
    });
    this.masterdata.getStatusList().subscribe(data => {
      this.statusList.next(data);
      this.selectStatus();
    });

    this.isAdmin = this.auth.currentUser.isAdmin;

  }

  isCheck(item: Data) {
    return this.tmp.underlying?.find(x => item.id === x?.id);
  }

  check(item: Data) {
    const index = this.tmp.underlyingList!.findIndex(x => x === item.id);
    if (index > -1) {
      this.tmp.underlyingList!.splice(index, 1);
    }
    else {
      this.tmp.underlyingList!.push(item.id);
    }
  }

  selectStatus() {
    if (this.tmp.statusDc) {
      const tmp = this.statusList.value.find(x => x.name === this.tmp.statusDc);
      this.status = tmp.category;
      if (this.status !== StatusCategories.Transferred) {
        this.tmp.transferTo = null;
      }
    }
    else {
      this.status = null;
      this.tmp.transferTo = null;
    }
  }

  async save() {
    this.tmp.underlying = this.tmp.underlyingList.map(x => ({ id: x }));
    const callToServer$ = this.editMode?
      this.admission.updateAdmit(this.tmp.id as GUID, this.tmp):
      this.admission.addAdmit(this.tmp);

    await addOrEdit(this.injector, {
        addOrEditCall: callToServer$,
        successTxt: { editMode: this.editMode, name: 'Admission' },
        isModal: true,
        content: this.content,
        errorCallback: (err) => {
          this.error = err;
        },
        successCallback: (data) => {
          if (data) {
            this.tmp = Object.assign(this.tmp, data);
          }
          else {
            this.tmp.updatedBy = this.auth.currentUser.id;
            this.tmp.updated = new Date();
          }
          this.tmp.underlying = this.tmp.underlyingList.map(x => (this.underlyingList.find(n => n.id === x)));
          
          return this.tmp;
        },
        completeCallback: () => this.error = null
      });
  }

}
