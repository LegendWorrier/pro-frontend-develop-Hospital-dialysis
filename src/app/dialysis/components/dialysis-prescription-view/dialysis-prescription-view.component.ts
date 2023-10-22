import { DialysisModeName, DialysisMode } from './../../dialysis-mode';
import { Hemosheet } from 'src/app/dialysis/hemosheet';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { decimalFormat } from 'src/app/utils';
import { DialysisPrescription } from '../../dialysis-prescription';

@Component({
  selector: 'dialysis-prescription',
  templateUrl: './dialysis-prescription-view.component.html',
  styleUrls: ['./dialysis-prescription-view.component.scss'],
})
export class DialysisPrescriptionViewComponent implements OnInit {
  @Input() prescription: DialysisPrescription;
  @Input() full: boolean;

  @Input() isAcNotUsed: boolean;
  @Input() reasonForRefrain: string;

  modes = DialysisMode;
  modeNames = DialysisModeName;

  acNotUsed = false;
  fromPrescription = false;

  constructor(private plt: Platform, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.update();
  }

  get width() {
    return this.plt.width();
  }

  get decimal() {
    return decimalFormat();
  }

  update(hemosheet?: Hemosheet) {
    if (hemosheet) {
      this.isAcNotUsed = hemosheet.acNotUsed;
      this.reasonForRefrain = hemosheet.reasonForRefraining;
      this.prescription = hemosheet.dialysisPrescription as DialysisPrescription;
    }
    
    this.acNotUsed = this.isAcNotUsed || this.prescription.reasonForRefraining != null || this.prescription.isAcNotUsed;
    this.fromPrescription = this.prescription.isAcNotUsed;
    this.cdr.detectChanges();
  }

  getReasonForRefrain() { return this.prescription.reasonForRefraining ?? this.reasonForRefrain; }

}
