import { AlertInfo } from 'src/app/monitor/alert-info';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alarm-list',
  templateUrl: './alarm-list.component.html',
  styleUrls: ['./alarm-list.component.scss'],
})
export class AlarmListComponent implements OnInit {

  @Input() list: AlertInfo[];

  mapDesc = [
    '"Blood Pressure" alarm has occurred.',
    '"Blood Leak" alarm has occurred.',
    '"Arterial Pressure" alarm has occurred.',
    '"Venous Pressure" alarm has occurred.',
    '"Dialysate Temperature" alarm has occurred.',
    '"TMP" alarm has occurred.',
    '"Air" alarm has occurred.',
    '"Bicarbonate Conduct" alarm has occurred.',
    '"Total Conduct" alarm has occurred.',
    'Some alarm (non-critical) has occurred.'
  ]

  constructor() { }

  ngOnInit() {}

}
