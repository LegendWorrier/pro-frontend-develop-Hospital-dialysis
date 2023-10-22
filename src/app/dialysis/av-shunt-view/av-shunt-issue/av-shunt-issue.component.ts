import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { Patient } from 'src/app/patients/patient';
import { AvShuntIssueTreatment } from '../../av-shunt-issue-treatment';

@Component({
  selector: 'av-shunt-issue',
  templateUrl: './av-shunt-issue.component.html',
  styleUrls: ['./av-shunt-issue.component.scss'],
})
export class AvShuntIssueComponent implements OnInit {
  @Input() patient: Patient;
  @Input() list: AvShuntIssueTreatment[];
  @Input() nav: IonNav;

  @Output() onEdit = new EventEmitter<AvShuntIssueTreatment>();
  @Output() onDelete = new EventEmitter<AvShuntIssueTreatment>();
  
  constructor() { }

  ngOnInit() {}

  onSelect([item]: [AvShuntIssueTreatment]){
    this.onEdit.emit(item);
  }

  onOptionSelect([item, i]:[AvShuntIssueTreatment, number]) {
    this.onDelete.emit(item);
  }

}
