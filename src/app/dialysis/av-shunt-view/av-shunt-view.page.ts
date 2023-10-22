import { AuthService } from './../../auth/auth.service';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { IonNav, AlertController } from '@ionic/angular';
import { formatISO } from 'date-fns';
import { Patient } from 'src/app/patients/patient';
import { AvShunt } from '../av-shunt';
import { AvShuntIssueTreatment } from '../av-shunt-issue-treatment';
import { AvShuntService } from '../av-shunt.service';
import { EditAvIssuePage } from './edit-av-issue/edit-av-issue.page';
import { EditAvShuntPage } from './edit-av-shunt/edit-av-shunt.page';
import { Permissions } from 'src/app/enums/Permissions';

@Component({
  selector: 'app-av-shunt-view',
  templateUrl: './av-shunt-view.page.html',
  styleUrls: ['./av-shunt-view.page.scss'],
})
export class AvShuntViewPage implements OnInit {
  @Input() patient: Patient;

  tabList = [
    {
      name: 'list',
      display: 'AV Shunt List',
      shortDisplay: 'List',
      icon: 'list-outline'
    },
    {
      name: 'issue',
      display: 'Issues And Treatments',
      shortDisplay: 'Issues',
      icon: 'information-circle-outline'
    }
  ];

  data: {
    avShunts: AvShunt[];
    issueTreatments: AvShuntIssueTreatment[];
  } = { avShunts: [], issueTreatments: [] };
  shuntList: AvShunt[];
  issueList: AvShuntIssueTreatment[];

  tab: string;
  showDeleted: boolean;
  updating: AvShunt | AvShuntIssueTreatment;

  maxDate: string;
  canEdit: boolean;

  constructor(public nav: IonNav, private avshunt: AvShuntService, private alertCtl: AlertController, private auth: AuthService) { }

  ngOnInit() {
    this.initList();
    const date = new Date();
    this.maxDate = formatISO(date);
    this.canEdit = this.auth.currentUser.checkPermissionLevel(Permissions.NotDoctor);
  }

  addNew() {
    if (this.tab === 'issue') {
      this.nav.push(EditAvIssuePage, { patientId: this.patient.id });
    }
    else {
      this.nav.push(EditAvShuntPage, { patientId: this.patient.id });
    }
  }

  edit(data: AvShunt | AvShuntIssueTreatment) {
    this.updating = data;
    if (data.type === 'avShunt') {
      this.nav.push(EditAvShuntPage, { avShunt: data });
    }
    else {
      const onNewShunt = new EventEmitter<AvShunt>();
      onNewShunt.subscribe(v => this.updateNewItem(v));
      this.nav.push(EditAvIssuePage, { issue: data, onAddNewShunt: onNewShunt });
    }
  }

  async delete(data: AvShunt | AvShuntIssueTreatment) {
    const alert = await this.alertCtl.create({
      backdropDismiss: true,
      header: 'Confirm Delete',
      message: `Are you sure you want to delete this ${data.type === 'avShunt' ? 'AV Shunt data' : 'AV Issue'}?`,
      buttons: [
        {
          text: 'Confirm',
          role: 'OK',
          handler: () => {
            let delete$;
            if (data.type === 'avShunt') {
              delete$ = this.avshunt.deleteAvShunt(data);
            }
            else {
              delete$ = this.avshunt.deleteAvIssue(data);
            }
            delete$.subscribe(() => {
              data.isActive = false;
              this.updateList();
            });
          }
        },
        {
          text: 'Cancel'
        }
      ]
    });

    alert.present();
  }

  initList() {
    this.avshunt.getAvShuntView(this.patient.id)
      .subscribe(data => {
        this.data = data;
        this.data.avShunts.forEach(x => x.type = 'avShunt');
        this.data.issueTreatments.forEach(x => x.type = 'avIssue');
        this.updateList();
      });
  }

  updateList() {
    if (this.data.avShunts.length > 0) {
      this.shuntList = this.showDeleted ? this.data.avShunts : this.data.avShunts.filter(x => x.isActive);
    }
    if (this.data.issueTreatments.length > 0) {
      this.issueList = this.showDeleted ? this.data.issueTreatments : this.data.issueTreatments.filter(x => x.isActive);
    }
  }

  ionViewWillEnter() {

    const data = this.avshunt.getTmp();
    if (data) {
      if (this.updating) {
        Object.assign(this.updating, data);
        this.updating = null;
        this.updateList();
      }
      else {
        this.updateNewItem(data);
      }
    }
    this.updating = null;
  }

  updateNewItem(data: any) {
    console.log('add new item');
    if (data) {
      if (data.type === 'avShunt') {
        this.data.avShunts.unshift(data);
      }
      else {
        this.data.issueTreatments.unshift(data);
      }
    }
    this.updateList();
  }

}
