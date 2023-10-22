import { Component, Input, OnInit } from '@angular/core';
import { MedHistoryItemInfo } from '../../med-history';
import { Medicine } from 'src/app/masterdata/medicine';
import { PatientInfo } from '../../patient-info';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-med-popover',
  templateUrl: './med-popover.component.html',
  styleUrls: ['./med-popover.component.scss'],
})
export class MedPopoverComponent  implements OnInit {
  @Input() items: MedHistoryItemInfo[];
  @Input() med: Medicine;
  @Input() patient: PatientInfo;

  constructor(
    private popoverCtl: PopoverController
  ) { }

  ngOnInit(): void {
    
  }

  confirm(item: MedHistoryItemInfo) {
    this.popoverCtl.dismiss(item, 'OK');
  }

}
