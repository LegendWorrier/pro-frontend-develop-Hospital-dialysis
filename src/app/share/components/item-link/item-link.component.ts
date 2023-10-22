import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-item-link',
  templateUrl: './item-link.component.html',
  styleUrls: ['./item-link.component.scss'],
})
export class ItemLinkComponent  implements OnInit {

  @Input() isActive: boolean;
  @Output() isActiveChange = new EventEmitter<boolean>();

  @Input() data: {
    title: string;
    url: string;
    icon: string;
    iconActive: string;
  }

  constructor() { }

  ngOnInit() {}

  onRouterChange(isActive) {
    this.isActive = isActive;
    this.isActiveChange.emit(this.isActive);
  }

}
