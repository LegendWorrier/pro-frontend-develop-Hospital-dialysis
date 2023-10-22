import { Component, Injector, OnInit } from '@angular/core';
import { IonNav, LoadingController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { PatienHistoryItem } from 'src/app/masterdata/patient-history-item';
import { presentToast, ToastType } from 'src/app/utils';
import { PatientHistoryDetailPage } from './patient-history-detail/patient-history-detail.page';

@Component({
  selector: 'app-patient-history-setting',
  templateUrl: './patient-history-setting.page.html',
  styleUrls: ['./patient-history-setting.page.scss'],
})
export class PatientHistorySettingPage implements OnInit {

  historyList: PatienHistoryItem[];

  canEdit: boolean;

  updating: PatienHistoryItem;

  constructor(
    private master: MasterdataService,
    private auth: AuthService,
    private nav: IonNav,
    private loadingCtl: LoadingController,
    private injector: Injector) { }

  ngOnInit() {
    this.canEdit = this.auth.currentUser.checkPermission('patient-history');

    this.master.getPatientHistoryItemList().subscribe(data => this.historyList = data);
  }

  edit(item: PatienHistoryItem) {
    this.updating = item;
    this.nav.push(PatientHistoryDetailPage,
      {
        entry: item,
        canEdit: this.canEdit
      });
  }

  async swap(first: PatienHistoryItem, second: PatienHistoryItem) {
    if (!second || !first) {
      return;
    }

    const firstIndex = this.historyList.findIndex(x => x.id === first.id);
    const secondIndex = this.historyList.findIndex(x => x.id === second.id);
    [this.historyList[firstIndex], this.historyList[secondIndex]] = [this.historyList[secondIndex], this.historyList[firstIndex]];

    const loading = await this.loadingCtl.create({
      backdropDismiss: false
    });
    loading.present();
    this.master.swapPatienHistoryItems(first, second)
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
          message: 'Failed to reorder the entries, please try again.',
          type: ToastType.alert
        });
        // reset
        [this.historyList[firstIndex], this.historyList[secondIndex]] = [this.historyList[secondIndex], this.historyList[firstIndex]];
      }
    });
  }

  add() {
    const lastOrder = this.historyList.length;
    this.nav.push(PatientHistoryDetailPage,
      {
        lastOrder,
        canEdit: this.canEdit
      });
  }

  ionViewWillEnter() {
    const data: PatienHistoryItem = this.master.getTmp();
    if (data) {
      if (this.updating) {
        if (data.id === 0) {
          // delete
          this.historyList.splice(this.historyList.indexOf(this.updating), 1);
        }
        else {
          // updating
          Object.assign(this.updating, data);
        }
      }
      else {
        // add
        this.historyList.push(data);
      }
    }

    // always clear updating to prevent bug
    this.updating = null;

  }

}
