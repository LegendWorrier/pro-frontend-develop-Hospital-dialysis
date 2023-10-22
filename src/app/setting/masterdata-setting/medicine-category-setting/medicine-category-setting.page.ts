import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Data } from 'src/app/masterdata/data';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';

@Component({
  selector: 'app-medicine-category-setting',
  templateUrl: './medicine-category-setting.page.html',
  styleUrls: ['./medicine-category-setting.page.scss'],
})
export class MedicineCategorySettingPage implements OnInit {
  @Input() categories: Data[];
  @Output() categoriesChange: EventEmitter<Data[]> = new EventEmitter<Data[]>();

  getDataList: Observable<Data[]>;
  addData: (item: any) => Observable<Data>;
  editData: (item: any) => Observable<void>;
  deleteData: (item: any) => Observable<void>;

  canEdit = false;

  constructor(private master: MasterdataService, private auth: AuthService) {
    this.getDataList = this.master.getMedicineCategoryList();
    this.addData = (item) => this.master.addMedicineCategory(item);
    this.editData = (item) => this.master.editMedicineCategory(item);
    this.deleteData = (item) => this.master.deleteMedicineCategory(item);
  }

  ngOnInit() {
    this.canEdit = this.auth.currentUser.checkPermission('med-category');
  }

}
