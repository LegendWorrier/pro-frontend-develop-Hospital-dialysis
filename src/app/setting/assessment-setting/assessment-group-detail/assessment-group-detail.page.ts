import { AssessmentService } from 'src/app/dialysis/assessment.service';
import { AssessmentGroup, AssessmentGroupInfo } from './../../../dialysis/assessment';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent, AlertController, LoadingController, IonNav } from '@ionic/angular';
import { AssessmentTypes } from 'src/app/enums/assessment-type.enum';
import { addOrEdit, deepCopy, presentToast, ToastType } from 'src/app/utils';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-assessment-group-detail',
  templateUrl: './assessment-group-detail.page.html',
  styleUrls: ['./assessment-group-detail.page.scss'],
})
export class AssessmentGroupDetailPage implements OnInit {
  @Input() group: AssessmentGroupInfo;
  @Input() lastPre: number;
  @Input() lastOther: number;
  @Input() lastPost: number;
  @Input() lastDialysis: number;
  editMode: boolean;

  error: string;
  @ViewChild(IonContent) content: IonContent;

  types = Object.values(AssessmentTypes).filter(x => typeof(x) === "number").map(x => { return { text: AssessmentTypes[x], value: x }});

  constructor(
    private assessmentService: AssessmentService,
    private alertCtl: AlertController,
    private loadingCtl: LoadingController,
    private injector: Injector,
    private nav: IonNav) { }

  ngOnInit() {
    if (this.group) {
      this.editMode = true;
      const original = deepCopy(this.group);
      this.assessmentService.setTmp(original);
    }
    else {
      this.group = new AssessmentGroup;
    }
  }

  save() {
    if (!this.editMode) {
      (<AssessmentGroup> this.group).order = 
        this.group.type === AssessmentTypes.Pre ? this.lastPre :
        this.group.type === AssessmentTypes.Other? this.lastOther :
        this.group.type === AssessmentTypes.Post? this.lastPost : this.lastDialysis;
    }

    const $call = this.editMode ?
      this.assessmentService.updateGroup(this.group)
      : this.assessmentService.addGroup(this.group);
    addOrEdit(this.injector, {
      addOrEditCall: $call,
      successCallback: (data: AssessmentGroupInfo) => {
        if (this.editMode) {
          this.assessmentService.setTmp(null);
          this.group.updated = data.updated;
          this.group.updatedBy = data.updatedBy;
        }
        else {
          this.assessmentService.setTmp(data);
        }
      },
      successTxt: {
        name: 'Assessment Group',
        editMode: this.editMode
      },
      errorCallback: (err) => this.error = err,
      completeCallback: () => this.error = null,
      content: this.content,
      isModal: true
    });
  }

  async delete() {
    const alert = await this.alertCtl.create({
      backdropDismiss: true,
      header: 'Confirmation',
      subHeader: 'Delete Assessment Group',
      message: 'Are you sure you want to delete this group?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          role: 'OK',
          handler: async () => {
            const loading = await this.loadingCtl.create({backdropDismiss: false});
            loading.present();
            this.assessmentService.removeGroup(this.group)
              .pipe(finalize(() => loading.dismiss()))
              .subscribe({
                next: () => {
                  this.assessmentService.setTmp({id: 0});
                  presentToast(this.injector, {
                    message: 'The group has been permanently deleted.',
                    header: 'Deleted',
                    type: ToastType.alert
                  });
                  this.nav.pop();
                },
                error: (err) => {
                  console.log(err);
                  presentToast(this.injector, {
                    message: 'Cannot delete the group due to some technical issue. Please try again.',
                    header: 'Failed',
                    native: true
                  });
                }
              });
          }
        }
      ]
    });
    alert.present();
  }

}
