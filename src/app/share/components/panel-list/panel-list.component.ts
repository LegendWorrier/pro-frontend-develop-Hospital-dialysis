import { Router, ActivatedRoute } from '@angular/router';
import { IonNav } from '@ionic/angular';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-panel-list',
  templateUrl: './panel-list.component.html',
  styleUrls: ['./panel-list.component.scss'],
})
export class PanelListComponent implements OnInit {

  @Input() list: {
    title: string,
    url: string,
    icon?: string,
    disabled?: boolean
  }[] | {
    title: string,
    component: any,
    icon?: string,
    disabled?: boolean
  }[];
  @Input() targetNav: IonNav;

  @Input() navMode = false;

  @Output() onSelectItem: EventEmitter<any|string> = new EventEmitter();

  constructor(private nav: IonNav, private router: Router, private route: ActivatedRoute ) { }

  ngOnInit() {
    if (this.navMode && !this.targetNav) {
      this.targetNav = this.nav;
    }
  }

  onSelect(urlOrComponent: string | any, item: any) {
    if (this.navMode || this.targetNav) {
      this.targetNav.push(urlOrComponent);
    }
    else {
      this.router.navigate([urlOrComponent as string], { relativeTo: this.route });
    }
    this.onSelectItem.emit(item);
  }

}
