import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Unit } from 'src/app/masterdata/unit';

export interface UnitSelectData {
  unitList: Unit[];
  current: number;
}

@Component({
  selector: 'app-unit-select',
  templateUrl: './unit-select.component.html',
  styleUrls: ['./unit-select.component.scss'],
})
export class UnitSelectComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<UnitSelectComponent>,
              @Inject(MAT_DIALOG_DATA) public data: UnitSelectData) { }

  ngOnInit() {

  }

  onSelect(item: Unit) {
    if (item.id === this.data.current) {
      return;
    }
    this.dialogRef.close(item);
  }

}
