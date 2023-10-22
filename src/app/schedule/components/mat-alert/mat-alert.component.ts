import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface AlertData {
  header?: string;
  subheader?: string;
  message?: string;
  buttons: { text: string, role?: string }[];
}

@Component({
  selector: 'app-mat-alert',
  templateUrl: './mat-alert.component.html',
  styleUrls: ['./mat-alert.component.scss'],
})
export class MatAlertComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<MatAlertComponent>,
              @Inject(MAT_DIALOG_DATA) public data: AlertData) { }

  ngOnInit() {}

  onClick(role?: string) {
    this.dialogRef.close(role);
  }
}
