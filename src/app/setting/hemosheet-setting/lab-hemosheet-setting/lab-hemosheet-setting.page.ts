import { LabHemosheetInfo } from './../../../lab-exam/lab-exam';
import { deepCopy, addOrEdit } from 'src/app/utils';
import { IonNav, LoadingController, Platform } from '@ionic/angular';
import { ModalSearchListComponent, ModalSearchParams } from './../../../share/components/modal-search-list/modal-search-list.component';
import { LabItemInfo } from './../../../masterdata/labItem';
import { MasterdataService } from './../../../masterdata/masterdata.service';
import { LabService } from './../../../lab-exam/lab.service';
import { Component, OnInit, Injector } from '@angular/core';
import { BehaviorSubject, filter, first, firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'app-lab-setting',
  templateUrl: './lab-hemosheet-setting.page.html',
  styleUrls: ['./lab-hemosheet-setting.page.scss'],
})
export class LabHemosheetSettingPage implements OnInit {

  labItemList: LabItemInfo[];

  list: LabHemosheetInfo[];

  ori: LabHemosheetInfo[];
  error: string;

  onReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  onLabListReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get width() {return this.plt.width();}

  constructor(
    private loadCtl: LoadingController,
    private labService: LabService,
    private master: MasterdataService,
    private plt: Platform,
    private nav: IonNav,
    private injector: Injector) { }

  ngOnInit() {
    this.master.getLabItemList().subscribe(x => {
      this.labItemList = x;
      this.onLabListReady$.next(true);
    });
    this.labService.getLabHemosheetList().subscribe(x => {
      this.list = x;
      this.ori = deepCopy(this.list);
      this.onReady$.next(true);
    });
  }

  async add() {
    if (!this.list) {
      const load = await this.loadCtl.create();
      load.present();

      await firstValueFrom(this.onReady$.pipe(first(x => !!x)));
      load.dismiss();
    }

    const ids = this.list.map(x => x.labItemId);
    const onSelect = (data) => {
      if (data) {
        this.list.push({
          onlyOnDate: true,
          labItemId: data.id,
          itemName: data.name,
          itemIsYesNo: data.isYesNo
        } as LabHemosheetInfo);
      }
      return true;
    };

    await this.nav.push(ModalSearchListComponent, {
      title: 'Add Lab to report',
      data: this.onLabListReady$.pipe(filter(x => !!x), map(() => this.labItemList?.filter(x => !ids.includes(x.id)))),
      getSearchKey: x => x.name,
      onItemSelect: onSelect,
      nav: this.nav
    } as ModalSearchParams<LabItemInfo>);
  }

  del(item: LabHemosheetInfo) {
    this.list.splice(this.list.indexOf(item), 1);
  }

  save() {
    addOrEdit(this.injector, {
      addOrEditCall: this.labService.addOrUpdateLabHemosheetList(this.list),
      successTxt: 'Updated',
      isModal: true,
      errorCallback: err => {
        this.list = deepCopy(this.ori);
        this.error = err;
      }
    });
  }

}
