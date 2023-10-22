import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { first, forkJoin } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { WebSocketService } from 'src/app/share/service/web-socket.service';
import { AuthService } from '../auth.service';
import { Loading } from 'src/app/loading-intercept';
import { LanguageService } from 'src/app/share/service/language.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.page.html',
  styleUrls: ['./loading.page.scss'],
})
export class LoadingPage implements OnInit, AfterViewInit {

  constructor(
    private route: ActivatedRoute,
    private nav: NavController,
    private websocket: WebSocketService,
    private lang: LanguageService,
    private auth: AuthService) { }

  ngAfterViewInit(): void {
  }

  ngOnInit() {
    console.log('loading page start validating...');
    // flag to tell the app that first loading is init
    Loading.Bypass = true;

    const target = this.route.snapshot.queryParamMap.get('url');
    if (target) {
      forkJoin([AppConfig.configWatch.pipe(first(x => !!x)), this.lang.afterInit])
        .subscribe(() => {
          this.nav.navigateRoot(target, { animationDirection: 'forward' });
        });
    }
  }

}
