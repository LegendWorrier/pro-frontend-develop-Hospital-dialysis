import { PatientInfo } from './../../../patients/patient-info';
import { LabExamInfo } from './../../lab-exam';
import { Component, Input, OnInit } from "@angular/core";
import { LabItem } from 'src/app/masterdata/labItem';
import { PopoverController } from '@ionic/angular';

@Component({
    selector: 'app-lab-popover',
    templateUrl: './lab-popover.component.html',
    styleUrls: ['./lab-popover.component.scss'],
  })
  export class LabPopoverComponent implements OnInit {
    @Input() items: LabExamInfo[];
    @Input() lab: LabItem;
    @Input() patient: PatientInfo;

    constructor(
      private popoverCtl: PopoverController
    ) { }

    ngOnInit(): void {
      
    }

    confirm(item: LabExamInfo) {
      this.popoverCtl.dismiss(item, 'OK');
    }

  }