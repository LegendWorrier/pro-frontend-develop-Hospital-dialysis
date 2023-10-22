import { Component, Input, OnInit } from '@angular/core';
import { PRIMARY_OUTLET, Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-back-btn-group',
  templateUrl: './back-button-group.component.html',
  styleUrls: ['./back-button-group.component.scss'],
  host: {
    ngNoHost: '',
  }
})
export class BackButtonGroupComponent implements OnInit {
  // @ViewChild(TemplateRef, { static: true }) template;
  @Input() prev: string;

  isRoot = true;

  constructor(
    private navCtl: NavController,
    private router: Router,
    // private viewContainerRef: ViewContainerRef
    )
    {}

  ngOnInit() {
      const previous = this.router.getCurrentNavigation()?.previousNavigation;

      if (previous && previous.finalUrl.root.children[PRIMARY_OUTLET].segments[0].path !== 'init') {
        this.isRoot = false;
      }
    // this.viewContainerRef.createEmbeddedView(this.template);
  }

  home() {
    this.navCtl.navigateBack('');
  }

}
