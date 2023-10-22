import { AssessmentGroupInfo } from './../../../dialysis/assessment';
import { Component, Injector, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IonNav, LoadingController } from '@ionic/angular';
import { AssessmentService } from 'src/app/dialysis/assessment.service';
import { AssessmentTypes } from 'src/app/enums/assessment-type.enum';
import { AssessmentGroupDetailPage } from '../assessment-group-detail/assessment-group-detail.page';
import { finalize } from 'rxjs/operators';
import { presentToast, ToastType } from 'src/app/utils';

@Component({
  selector: 'app-group-setting',
  templateUrl: './assessment-group-setting.page.html',
  styleUrls: ['./assessment-group-setting.page.scss'],
})
export class AssessmentGroupSettingPage implements OnInit {

  @Input() preGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);
  @Input() otherGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);
  @Input() postGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);
  @Input() dialysisGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);

  updating: AssessmentGroupInfo;

  constructor(
    private assessmentService: AssessmentService,
    private nav: IonNav,
    private injector: Injector,
    private loadingCtl: LoadingController) { }

  ngOnInit() {
    
  }

  edit(item: AssessmentGroupInfo) {
    this.updating = item;
    this.nav.push(AssessmentGroupDetailPage, { group: item });
  }

  async swap(first: AssessmentGroupInfo, second: AssessmentGroupInfo) {
    if (!second || !first) {
      return;
    }

    let list: AssessmentGroupInfo[];
    if (first.type === AssessmentTypes.Pre) {
      list = this.preGroups.value;
    }
    else if (first.type === AssessmentTypes.Other) {
      list = this.otherGroups.value;
    }
    else if (first.type === AssessmentTypes.Post) {
      list = this.postGroups.value;
    }
    else {
      list = this.dialysisGroups.value;
    }

    const firstIndex = list.findIndex(x => x.id === first.id);
    const secondIndex = list.findIndex(x => x.id === second.id);
    [list[firstIndex], list[secondIndex]] = [list[secondIndex], list[firstIndex]];

    const loading = await this.loadingCtl.create({
      backdropDismiss: false
    });
    loading.present();
    this.assessmentService.reorderGroup(first, second)
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
          message: 'Failed to reorder the group, please try again.',
          type: ToastType.alert
        });
        // reset
        [list[firstIndex], list[secondIndex]] = [list[secondIndex], list[firstIndex]];
      }
    });
  }

  add() {
    const lastPre = this.preGroups.value.length;
    const lastPost = this.postGroups.value.length;
    const lastOther = this.otherGroups.value.length;
    const lastDialysis = this.dialysisGroups.value.length;
    this.nav.push(AssessmentGroupDetailPage, { lastPre, lastPost, lastOther, lastDialysis });
  }

  ionViewWillEnter() {

    if (!this.preGroups.value) {
      return;
    }

    const data: AssessmentGroupInfo = this.assessmentService.getTmp();
    if (data) {
      if (this.updating) {
        if (data.id === 0) {
          // delete
          if (this.updating.type === AssessmentTypes.Pre) {
            this.preGroups.value.splice(this.preGroups.value.indexOf(this.updating), 1);
          }
          else if(this.updating.type === AssessmentTypes.Other) {
            this.otherGroups.value.splice(this.otherGroups.value.indexOf(this.updating), 1);
          }
          else if(this.updating.type === AssessmentTypes.Post) {
            this.postGroups.value.splice(this.postGroups.value.indexOf(this.updating), 1);
          }
          else {
            this.dialysisGroups.value.splice(this.dialysisGroups.value.indexOf(this.updating), 1);
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
          this.preGroups.value.push(data);
        }
        else if(data.type === AssessmentTypes.Other) {
          this.otherGroups.value.push(data);
        }
        else if(data.type === AssessmentTypes.Post) {
          this.postGroups.value.push(data);
        }
        else {
          this.dialysisGroups.value.push(data);
        }
      }
    }

    // always clear updating to prevent bug
    this.updating = null;

  }

}
