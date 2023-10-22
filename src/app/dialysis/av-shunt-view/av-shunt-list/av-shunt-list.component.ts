import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { Patient } from 'src/app/patients/patient';
import { AvShunt } from '../../av-shunt';
import { AvShuntService } from '../../av-shunt.service';
import { HemoDialysisService } from '../../hemo-dialysis.service';

@Component({
  selector: 'av-shunt-list',
  templateUrl: './av-shunt-list.component.html',
  styleUrls: ['./av-shunt-list.component.scss'],
})
export class AvShuntListComponent implements OnInit {
  @Input() patient: Patient;
  @Input() list: AvShunt[];
  @Input() nav: IonNav;

  @Output() onEdit = new EventEmitter<AvShunt>();
  @Output() onDelete = new EventEmitter<AvShunt>();

  constructor(private avshunt: AvShuntService) { }

  ngOnInit() {}

  onSelect([item]: [AvShunt]){
    this.onEdit.emit(item);
  }

  onOptionSelect([item, i]:[AvShunt, number]) {
    this.onDelete.emit(item);
  }

  getName(item: AvShunt) {
    if (!item) {
      return null;
    }
    return this.avshunt.getAvShuntSiteName(item);
  }

}
