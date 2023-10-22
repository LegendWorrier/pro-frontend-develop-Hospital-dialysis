import { Component, EventEmitter, Input, OnInit, Output, Injector } from '@angular/core';
import { IonNav, ModalController, NavParams, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { Permissions } from 'src/app/enums/Permissions';
import { ModalBack, addOrEdit, deepCopy } from 'src/app/utils';
import { ExecutionRecord, ExecutionType, MedicineRecord } from '../execution-record';
import { RecordService } from '../record.service';
import { MedicinePrescriptionService } from 'src/app/patients/medicine-prescription.service';

@Component({
  selector: 'app-medicine-record-view',
  templateUrl: './medicine-record-view.page.html',
  styleUrls: ['./medicine-record-view.page.scss'],
})
export class MedicineRecordViewPage implements OnInit {

  @Input() unitId: number;
  @Input() record: MedicineRecord;
  @Input() deleteFunc: (item: ExecutionRecord) => Promise<boolean>;

  @Output() onExecuted: EventEmitter<any> = new EventEmitter();
  @Output() onCosignChange: EventEmitter<any> = new EventEmitter();

  canEdit: boolean;
  tmp: MedicineRecord;

  get width() {
    return this.plt.width();
  }

  constructor(
    private auth: AuthService,
    private recordService: RecordService,
    private medPres: MedicinePrescriptionService,
    private nav: IonNav,
    private params: NavParams,
    private modal: ModalController,
    private plt: Platform,
    private injector: Injector) { }

  ngOnInit() {
    this.tmp = deepCopy(this.record);
    this.canEdit = this.auth.currentUser.checkPermissionLevel(Permissions.HeadNurseOnly);
  }

  canExecute() {
    return this.recordService.checkCanExecute(this.record);
  }

  canRequest() {
    return this.record.isExecuted && this.auth.currentUser.id === this.record.createdBy;
  }

  async delete() {
    const result = await this.deleteFunc(this.record);
    if (result) {
      ModalBack(this.nav, this.params, this.modal);
    }
  }

  async execute() {
    const result = await this.recordService.executeWithPromt(this.record);
    if (result) {
      this.onExecuted.emit();
    }
  }

  async requestCosign() {
    const result = await this.recordService.requestCosignPromt(this.record, this.unitId);
    if (result) {
      this.onCosignChange.emit();
    }
  }

  getRoutes() {
    return this.medPres.getRouteMap(this.record.prescription.medicine.usageWays, false);
  }

  async update() {
    await addOrEdit(this.injector, {
      addOrEditCall: this.recordService.updateExecutionRecord(this.tmp, ExecutionType.Medicine),
      successTxt: { editMode: true, name: 'Medicine Record' },
      successCallback: () => {
        this.record.overrideDose = this.tmp.overrideDose;
        this.record.overrideRoute = this.tmp.overrideRoute;
      },
      isModal: true,
    });
  }

}
