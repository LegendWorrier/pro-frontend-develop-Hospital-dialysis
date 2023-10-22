import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  static bypassFlag = false;

  constructor(private route: Router) { }

  ngOnInit() {
    // visit once per app loading
    WelcomePage.bypassFlag = true;
    setTimeout(() => {
      this.route.navigate(['']);
    }, 8500);
  }

}
