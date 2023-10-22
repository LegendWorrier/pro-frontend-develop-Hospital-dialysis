import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-find-option',
  templateUrl: './find-option.component.html',
  styleUrls: ['./find-option.component.scss'],
})
export class FindOptionComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<FindOptionComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {}

  before() {
    this.dialogRef.close('backward');
  }

  after() {
    this.dialogRef.close('forward');
  }
}
