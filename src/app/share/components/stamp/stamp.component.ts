import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'hemo-stamp',
  templateUrl: './stamp.component.html',
  styleUrls: ['./stamp.component.scss'],
})
export class StampComponent implements OnInit {
  @Input() text: string;
  

  constructor() { }

  ngOnInit() {
    if (!this.text) {
      this.text = 'System';
    }
  }

}
