import { Component, Input, OnInit } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { Data } from 'src/app/masterdata/data';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Medicine } from 'src/app/masterdata/medicine';
import { EditMedicinePrescriptionPage } from '../edit-medicine-prescription/edit-medicine-prescription.page';
import { MedicinePrescriptionInfo } from '../medicine-prescription';
import { Patient } from '../patient';

@Component({
  selector: 'app-select-medicine',
  templateUrl: './select-medicine.page.html',
  styleUrls: ['./select-medicine.page.scss'],
})
export class SelectMedicinePage implements OnInit {
  @Input() patient: Patient;
  @Input() presList: MedicinePrescriptionInfo[] = [];

  medicineList: Medicine[] = [];
  medCatList: Data[] = [];

  dataList: Medicine[] = [];
  filterCat: number;

  constructor(private master: MasterdataService, private nav: IonNav) { }

  ngOnInit() {
    this.master.getMedicineList().subscribe(data => {
      this.medicineList = data;
      this.dataList = data;
    });
    this.master.getMedicineCategoryList().subscribe(data => this.medCatList = data);
  }

  get filteredList(): Medicine[] {
    return this.filterCat ? this.dataList.filter(x => x.categoryId === this.filterCat) : this.dataList;
  }

  getMedCatList() {
    return [{name: 'All', id: null} as Data].concat(this.medCatList);
  }

  select(medicine: Medicine) {
    // Assuming create new only
    const overridable = this.presList.find(x => x.medicine.id === medicine.id && x.isActive && !x.isHistory);
    this.nav.push(EditMedicinePrescriptionPage, {
      isModal: true,
      patientId: this.patient.id,
      medicine,
      overrideId: overridable?.id,
      canEdit: true
    });
  }

}
