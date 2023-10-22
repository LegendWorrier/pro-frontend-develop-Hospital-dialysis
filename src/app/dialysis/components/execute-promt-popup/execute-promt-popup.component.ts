import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { formatISO } from 'date-fns';
import { ExecutionRecord } from '../../execution-record';

@Component({
  selector: 'app-execute-promt-popup',
  templateUrl: './execute-promt-popup.component.html',
  styleUrls: ['./execute-promt-popup.component.scss'],
})
export class ExecutePromtPopupComponent implements OnInit {
  @Input() record: ExecutionRecord;

  timestamp: Date | string;
  
  maxDate: string;

  constructor(private popup: PopoverController) { }

  ngOnInit() {
    if (!this.record) {
      throw "Execute Popup need props => record: ExecutionRecord";
    }
    
    this.timestamp = this.record.timestamp;

    const date = new Date();
    this.maxDate = formatISO(date);
  }

  request() {
    this.popup.dismiss(this.timestamp, 'OK');
  }

  now() {
    this.timestamp = formatISO(new Date());
  }

}
