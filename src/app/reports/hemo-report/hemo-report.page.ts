import { PageLoaderComponent } from './../../share/components/page-loader/page-loader.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { HemoDialysisService } from 'src/app/dialysis/hemo-dialysis.service';
import { Data } from 'src/app/masterdata/data';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { PageView } from 'src/app/share/page-view';
import { HemoResult } from '../../dialysis/hemo-result';

@Component({
  selector: 'app-hemo-report',
  templateUrl: './hemo-report.page.html',
  styleUrls: ['./hemo-report.page.scss'],
})
export class HemoReportPage implements OnInit {
  hemoRecords: HemoResult[] = [];

  unitList: Data[];

  multiUnit = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units.length > 1;

  firstLoad = true;
  searchString: string;

  @ViewChild("loader") loader: PageLoaderComponent<HemoResult>;

  constructor(
    private hemo: HemoDialysisService,
    private auth: AuthService,
    private master: MasterdataService,
    private navCtl: NavController) { }

  async ngOnInit() {
    this.unitList = await this.master.getUnitListFromCache();
  }

  ionViewWillEnter() {
  }

  get loadHemosheet$(): (page: number, limit: number, where?: string) => Observable<PageView<HemoResult>> {
    return (page, limit, where) => this.hemo.getAllHemoRecords(page, limit, null, where);
  }

  showReport(item: HemoResult) {
    this.navCtl.navigateForward(['reports', 'hemo-records', item.record.id]);
  }

  getUnit(id: number): string {
    return this.unitList?.find(x => x.id === id).name;
  }

  onSearch($event) {
    this.searchString = $event;
    this.loader.filter = this.searchString;
    this.loader.reload(true);
  }

}
