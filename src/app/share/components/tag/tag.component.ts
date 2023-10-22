import { Component, Input, OnInit } from '@angular/core';
import { Tag } from 'src/app/patients/patient-info';

@Component({
  selector: 'hemo-tag',
  template: `<ion-chip class="hemo-tag" [hemoTag]="tag" [placeholder]="placeholder" style="pointer-events: none;"></ion-chip>`,
  styleUrls: ['./tag.component.scss']
})
export class TagComponent implements OnInit {
  @Input() tag: Tag;
  @Input() placeholder: boolean;

  constructor() { }

  ngOnInit() {}

}
