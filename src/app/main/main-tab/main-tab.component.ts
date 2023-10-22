import { Component, OnInit, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { Feature } from 'src/app/enums/feature';
import { appPages } from 'src/app/utils';

@Component({
  selector: 'app-main-tab',
  templateUrl: './main-tab.component.html',
  styleUrls: ['./main-tab.component.scss'],
})
export class MainTabComponent  implements OnInit {
  appTabs = appPages;

  @ViewChild('tabs', { static: false }) tab: IonTabs;

  constructor(private auth: AuthService) { }

  ngOnInit() {
    if (!Feature.hasFlag(this.auth.Feature, Feature.Integrated)) {
      this.appTabs.splice(this.appTabs.findIndex(x => x.title.toLowerCase() === 'monitor'), 1);
    }
  }

}
