import { AssessmentGroupInfo } from './../../dialysis/assessment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonNav, LoadingController } from '@ionic/angular';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { AssessmentInfo } from 'src/app/dialysis/assessment';
import { AssessmentService } from 'src/app/dialysis/assessment.service';
import { AssessmentTypes } from 'src/app/enums/assessment-type.enum';
import { ServiceURL } from 'src/app/service-url';
import { addOrEdit, Backend, handleHttpError, presentToast, ToastType } from 'src/app/utils';
import { AssessmentDetailPage } from './assessment-detail/assessment-detail.page';
import { AssessmentGroupSettingPage } from './assessment-group-setting/assessment-group-setting.page';
import { AuthService } from 'src/app/auth/auth.service';
import * as saveAs from 'file-saver';
import { ImageAndFileUploadService } from 'src/app/share/service/image-and-file-upload.service';

@Component({
  selector: 'app-assessment-setting',
  templateUrl: './assessment-setting.page.html',
  styleUrls: ['./assessment-setting.page.scss'],
})
export class AssessmentSettingPage implements OnInit {

  preAssessments: BehaviorSubject<AssessmentInfo[]> = new BehaviorSubject<AssessmentInfo[]>(null);
  otherAssessments: BehaviorSubject<AssessmentInfo[]> = new BehaviorSubject<AssessmentInfo[]>(null);
  postAssessments: BehaviorSubject<AssessmentInfo[]> = new BehaviorSubject<AssessmentInfo[]>(null);
  dialysisAssessments: BehaviorSubject<AssessmentInfo[]> = new BehaviorSubject<AssessmentInfo[]>(null);
  hasReassessment: boolean;
  updating: AssessmentInfo;

  preGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);
  otherGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);
  postGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);
  dialysisGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);

  type = AssessmentTypes;

  constructor(
    private assessmentService: AssessmentService,
    private auth: AuthService,
    private file: ImageAndFileUploadService,
    private nav: IonNav,
    private injector: Injector,
    private loadingCtl: LoadingController,
    private alertCtl: AlertController,
    private http: HttpClient) { }

  ngOnInit() {
    this.initAssessment();

    this.hasReassessment = AppConfig.config.hasReassessment;
  }

  initAssessment() {
    this.assessmentService.getAll().subscribe((data) => {
      this.preAssessments.next(data.filter(x => x.type === AssessmentTypes.Pre));
      this.otherAssessments.next(data.filter(x => x.type === AssessmentTypes.Other));
      this.postAssessments.next(data.filter(x => x.type === AssessmentTypes.Post));
      this.dialysisAssessments.next(data.filter(x => x.type === AssessmentTypes.Dialysis));
    });
    this.assessmentService.getAllGroups().subscribe((data) => {
      this.preGroups.next(data.filter(x => x.type === AssessmentTypes.Pre));
      this.otherGroups.next(data.filter(x => x.type === AssessmentTypes.Other));
      this.postGroups.next(data.filter(x => x.type === AssessmentTypes.Post));
      this.dialysisGroups.next(data.filter(x => x.type === AssessmentTypes.Dialysis));
    });
  }

  getGroupItemList(group: AssessmentGroupInfo) {
    switch (group.type) {
      case AssessmentTypes.Pre:
        return this.preAssessments.value.filter(x => x.groupId === group.id);
      case AssessmentTypes.Post:
        return this.postAssessments.value.filter(x => x.groupId === group.id);
      case AssessmentTypes.Other:
        return this.otherAssessments.value.filter(x => x.groupId === group.id);
      case AssessmentTypes.Dialysis:
        return this.dialysisAssessments.value.filter(x => x.groupId === group.id);
      default:
        return [];
    }
  }

  getIsolatedList(type: AssessmentTypes) {
    switch (type) {
      case AssessmentTypes.Pre:
        return this.preAssessments.value.filter(x => !x.groupId);
      case AssessmentTypes.Post:
        return this.postAssessments.value.filter(x => !x.groupId);
      case AssessmentTypes.Other:
        return this.otherAssessments.value.filter(x => !x.groupId);
      case AssessmentTypes.Dialysis:
        return this.dialysisAssessments.value.filter(x => !x.groupId);
      default:
        return [];
    }
  }

  async reassessment() {
    const loading = await this.loadingCtl.create({
      message: 'Updating server setting..'
    });
    loading.present();
    const formData = new FormData();
    formData.append('hasReassessment', `${this.hasReassessment}`);
    this.http.post(Backend.Url + ServiceURL.config, formData)
      .pipe(
        finalize(() => loading.dismiss())
      )
      .subscribe({
        next: () => {
          AppConfig.reload(this.injector);

          presentToast(this.injector, {
            header: 'Updated',
            message: 'Server setting has been updated.',
            native: true
          });
        },
        error: (err) => {
          console.log(err);
          // reset
          this.hasReassessment = !this.hasReassessment;

          if (err instanceof HttpErrorResponse && err.status === 403) {
            handleHttpError(err);
          }
          presentToast(this.injector, {
            header: 'Error',
            message: 'Fail to update server setting. Please try again or contact an administrator.',
            type: ToastType.alert
          });
        }
      });
  }

  async swap(first: AssessmentInfo, second: AssessmentInfo) {
    if (!second || !first) {
      return;
    }

    let list: AssessmentInfo[];
    if (first.type === AssessmentTypes.Pre) {
      list = this.preAssessments.value;
    }
    else if (first.type === AssessmentTypes.Other) {
      list = this.otherAssessments.value;
    }
    else if (first.type === AssessmentTypes.Post) {
      list = this.postAssessments.value;
    }
    else {
      list = this.dialysisAssessments.value;
    }

    const firstIndex = list.findIndex(x => x.id === first.id);
    const secondIndex = list.findIndex(x => x.id === second.id);
    [list[firstIndex], list[secondIndex]] = [list[secondIndex], list[firstIndex]];

    const loading = await this.loadingCtl.create({
      backdropDismiss: false
    });
    loading.present();
    this.assessmentService.reorder(first, second)
    .pipe(finalize(() => loading.dismiss()))
    .subscribe({
      next: () => {
        presentToast(this.injector, {
          header: 'Saved',
          message: 'Change has been saved.',
          native: true
        });
      },
      error: (err) => {
        console.log(err);
        presentToast(this.injector, {
          header: 'Failed',
          message: 'Failed to reorder the assessments, please try again.',
          type: ToastType.alert
        });
        // reset
        [list[firstIndex], list[secondIndex]] = [list[secondIndex], list[firstIndex]];
      }
    });
  }

  add() {
    const lastPre = this.preAssessments.value.length;
    const lastPost = this.postAssessments.value.length;
    const lastOther = this.otherAssessments.value.length;
    const lastDialysis = this.dialysisAssessments.value.length;
    this.nav.push(AssessmentDetailPage,
      {
        lastPre, lastPost, lastOther, lastDialysis,
        preGroups: this.preGroups.value,
        otherGroups: this.otherGroups.value,
        postGroups: this.postGroups.value,
        dialysisGroups: this.dialysisGroups.value
      });
  }

  async edit(item: AssessmentInfo) {
    this.updating = item;
    this.nav.push(AssessmentDetailPage,
      {
        assessment: item,
        preGroups: this.preGroups.value,
        otherGroups: this.otherGroups.value,
        postGroups: this.postGroups.value,
        dialysisGroups: this.dialysisGroups.value
      });
  }

  ionViewWillEnter() {

    if (!this.preAssessments.value) {
      return;
    }

    const data: AssessmentInfo = this.assessmentService.getTmp();
    if (data) {
      if (this.updating) {
        if (data.id === 0) {
          // delete
          if (this.updating.type === AssessmentTypes.Pre) {
            this.preAssessments.value.splice(this.preAssessments.value.indexOf(this.updating), 1);
          }
          else if (this.updating.type === AssessmentTypes.Other) {
            this.otherAssessments.value.splice(this.otherAssessments.value.indexOf(this.updating), 1);
          }
          else if (this.updating.type === AssessmentTypes.Post) {
            this.postAssessments.value.splice(this.postAssessments.value.indexOf(this.updating), 1);
          }
          else {
            this.dialysisAssessments.value.splice(this.dialysisAssessments.value.indexOf(this.updating), 1);
          }
        }
        else {
          // updating
          Object.assign(this.updating, data);
        }
      }
      else {
        // add
        if (data.type === AssessmentTypes.Pre) {
          this.preAssessments.value.push(data);
        }
        else if (data.type === AssessmentTypes.Other) {
          this.otherAssessments.value.push(data);
        }
        else if (data.type === AssessmentTypes.Post) {
          this.postAssessments.value.push(data);
        }
        else {
          this.dialysisAssessments.value.push(data);
        }
      }
    }

    // always clear updating to prevent bug
    this.updating = null;

  }

  groups() {
    this.nav.push(AssessmentGroupSettingPage, {
      preGroups: this.preGroups,
      postGroups: this.postGroups,
      otherGroups: this.otherGroups,
      dialysisGroups: this.dialysisGroups
    });
  }

  // =================== Root Admin Only ==============
  async import() {
    if (!this.auth.currentUser.isPowerAdmin) {
      presentToast(this.injector, { message: 'Requires Root admin level.', native: true });
      return;
    }

    const warn = await this.alertCtl.create({
      header: 'Import Assessment Setting',
      subHeader: 'Import will erase all setting!',
      message: 'This operation will replace the whole setting in this page with your new setting file. Are you sure to process?',
      buttons: [
        { text: 'Cancel' },
        { role: 'ok', text: 'Confirm' }
      ]
    });
    warn.present();
    const result = await warn.onWillDismiss();
    
    if (result.role !== 'ok') {
      return;
    }

    const data = await this.file.browseLocalFile('.setup', 2)
      .catch((err) => {
        console.log(err);
        presentToast(this.injector, { header: 'Invalid', message: 'File is too big!', type: ToastType.alert });
      });
    if (!data) {
      return;
    }
    
    const loading = await this.loadingCtl.create();
    loading.present();
    await addOrEdit(this.injector, {
      addOrEditCall: this.assessmentService.import(data),
      successTxt: 'Imported assessment setting.',
      finalize: () => loading.dismiss(),
      stay: true,
      completeCallback: () => {
        this.initAssessment();
        AppConfig.reload(this.injector).then(() => this.hasReassessment = AppConfig.config.hasReassessment);
      },
      customErrorHandling: (err) => {
        if (err instanceof HttpErrorResponse && err.status === 400) {
          presentToast(this.injector, { header: 'Invalid', message: 'Invalid file. Please use setting file exported from another HemoPro system.', type: ToastType.alert });
          return true;
        }

        return false;
      }
    });

  }

  async export() {
    if (!this.auth.currentUser.isPowerAdmin) {
      presentToast(this.injector, { message: 'Requires Root admin level.', native: true });
      return;
    }
    const wait = await this.loadingCtl.create({ backdropDismiss: false, showBackdrop: false, message: 'Processing...' });
    wait.present();
    const data = await firstValueFrom(this.assessmentService.export());
    wait.dismiss();

    saveAs(data, 'assessment-setting-' + new Date().getTime() + '.setup', { autoBom: true });

  }
}
