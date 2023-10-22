import { Component, Input, OnInit } from '@angular/core';
import { MedicinePrescription } from '../../medicine-prescription';
import { MedicinePrescriptionService } from '../../medicine-prescription.service';
import { UsageWays } from 'src/app/masterdata/medicine';

@Component({
  selector: 'medicine-prescription',
  templateUrl: './medicine-prescription-view.component.html',
  styleUrls: ['./medicine-prescription-view.component.scss'],
})
export class MedicinePrescriptionViewComponent implements OnInit {
  @Input() prescription: MedicinePrescription;

  @Input() overrideRoute: UsageWays;
  @Input() overrideDose: number;

  constructor(private medPres: MedicinePrescriptionService) { }

  ngOnInit() {
  }

  getRoute() {
    return this.medPres.getRoute(this.overrideRoute ?? this.prescription.route);
  }

  getFreq() {
    return this.medPres.getFreq(this.prescription.frequency);
  }

  get expireDate() {
    return this.prescription.getExpireDate();
  }

  get amount() {
    return `${this.overrideDose ?? this.prescription.getTotalAmount()} ${this.prescription.getUnit()}`;
  }

}
