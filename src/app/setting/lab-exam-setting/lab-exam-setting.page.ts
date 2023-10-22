import { Component, Injector, OnInit } from '@angular/core';
import { LoadingController, Platform, IonNav } from '@ionic/angular';
import { BehaviorSubject, filter, map } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { LabItemInfo } from 'src/app/masterdata/labItem';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { ModalSearchListComponent, ModalSearchParams } from 'src/app/share/components/modal-search-list/modal-search-list.component';
import { ConfigService } from 'src/app/share/service/config.service';

@Component({
  selector: 'app-lab-exam-setting',
  templateUrl: './lab-exam-setting.page.html',
  styleUrls: ['./lab-exam-setting.page.scss'],
})
export class LabExamSettingPage implements OnInit {

  labItemList: LabItemInfo[];

  list: number[];
  ori: number[];
  error: string;
  
  onLabListReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get width() {return this.plt.width();}

  constructor(
    private configService: ConfigService,
    private master: MasterdataService,
    private plt: Platform,
    private nav: IonNav,
    private injector: Injector) { }

  ngOnInit() {
    this.master.getLabItemList().subscribe(x => {
      this.labItemList = x;
      this.onLabListReady$.next(true);
    });

    this.list = [...AppConfig.config.labExam?.defaultList ?? [] ];
    this.ori = AppConfig.config.labExam?.defaultList;
  }

  getName(id: number) {
    const info = this.labItemList?.find(x => x.id === id);
    return info?.name;
  }

  async add() {

    const onSelect = (data) => {
      if (data) {
        this.list.push(data.id);
      }
      return true;
    };

    await this.nav.push(ModalSearchListComponent, {
      title: 'Default Lab List',
      data: this.onLabListReady$.pipe(filter(x => !!x), map(() => this.labItemList?.filter(x => !this.list.includes(x.id)))),
      getSearchKey: x => x.name,
      onItemSelect: onSelect,
      nav: this.nav
    } as ModalSearchParams<LabItemInfo>);
  }

  del(id: number) {
    this.list.splice(this.list.indexOf(id), 1);
  }

  async save() {
    
    const formData = new FormData();
    formData.append('labExam', JSON.stringify({ defaultList: this.list }));
    await this.configService.updateConfig(formData, {
      onError: (_) =>
      // reset
      this.list = [...this.ori],
      onSuccess: () => {
        if (!AppConfig.config.labExam) {
          AppConfig.config.labExam = { defaultList: this.list };
        }
        else {
          AppConfig.config.labExam.defaultList = this.list;
        }
      }
    });
  }

}
