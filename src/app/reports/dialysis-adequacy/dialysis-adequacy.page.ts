import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, NavController } from '@ionic/angular';
import format from 'date-fns/format';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Data } from 'src/app/masterdata/data';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { PatientInfo } from 'src/app/patients/patient-info';
import { PatientService } from 'src/app/patients/patient.service';
import { PageLoaderComponent } from 'src/app/share/components/page-loader/page-loader.component';
import { PageView } from 'src/app/share/page-view';

@Component({
  selector: 'app-dialysis-adequacy',
  templateUrl: './dialysis-adequacy.page.html',
  styleUrls: ['./dialysis-adequacy.page.scss'],
})
export class DialysisAdequacyPage implements OnInit {

  patients: PatientInfo[] = [];

  unitList: Data[];

  multiUnit = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units.length > 1;

  firstLoad = true;
  searchString: string;

  selectedPatient: PatientInfo;
  selectedMonth: string = new Date().toISOString();;

  @ViewChild("loader") loader: PageLoaderComponent<PatientInfo>;

  constructor(private auth: AuthService, private patient: PatientService, private master: MasterdataService, private navCtl: NavController) { }

  async ngOnInit() {
    this.unitList = await this.master.getUnitListFromCache();
  }

  get loadPatients$(): (page: number, limit: number, where?: string) => Observable<PageView<PatientInfo>> {
    return (page, limit, where) => this.patient.getAllPatient(page, limit, null, null, where);
  }

  async showReport(item: PatientInfo, monthPicker: IonModal) {
    this.selectedPatient = item;
    await monthPicker.present();
    const result = await monthPicker.onWillDismiss().catch();
    if (result.role === 'ok') {
      const data = new Date(this.selectedMonth);
      const month = format(data, 'MM-yyyy');
      await this.navCtl.navigateForward(['reports', 'dialysis-adequacy', item.id, month]);
    }
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
