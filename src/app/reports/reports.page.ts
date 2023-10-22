import { GlobalErrorHandler } from './../global-error-handler';
import { Subscription } from 'rxjs';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ServiceURL } from '../service-url';
import { Backend } from '../utils';
import { TelerikReportViewerComponent } from '@progress/telerik-angular-report-viewer';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportsPage implements OnInit, AfterViewInit, OnDestroy {
  @Input() isModal: boolean;
  @Input() pageName: string;
  @Input() report: string;
  @Input() reportParams: {[name: string]: any};

  viewerContainerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
  };

  token;
  reportServiceUrl: string;
  templateUrl: string;

  isReady = false;

  reportSource: {
    report: string,
    parameters?: {[name: string]: any};
  };

  @ViewChild('report') reportViewer: TelerikReportViewerComponent;
  private tokenWatch: Subscription;

  constructor(private route: ActivatedRoute, private auth: AuthService, private ele: ElementRef) { }

  ngOnDestroy(): void {
    this.tokenWatch.unsubscribe();
  }

  ngOnInit() {
    $.ajaxSetup({ xhrFields: { withCredentials: true}});

    this.reportServiceUrl = Backend.ReportUrl + ServiceURL.report_base;
    this.templateUrl = Backend.ReportUrl + ServiceURL.report_template;
    this.tokenWatch = this.auth.tokenUpdate.subscribe(token => {
      console.log('token updated. report set token..', token);
      this.token = token;
      if (this.reportViewer) {
        this.reportViewer.setAuthenticationToken(token);
      }
    });

    this.route.data.subscribe((data) => {
      if (data) {
        this.pageName = this.pageName ?? data.pageName;
        this.report = this.report ?? data.report;
        this.reportParams = this.reportParams ?? Object.assign({}, data.reportParams);

        this.route.params.subscribe(params => {
          for (const key in this.reportParams) {
            if (Object.prototype.hasOwnProperty.call(this.reportParams, key)) {
              const element =  this.reportParams[key] as string;
              if (element.charAt(0) === ':') {
                const value = params[element.substring(1)];
                this.reportParams[key] = value;
              }
            }
          }
        });
      }
      
      // Crucial!: need to add userId to report param, so that we can send refresh report request to server correctly. 
      this.reportParams['userId'] = this.auth.currentUser.id
      
      this.reportSource = {
        report: this.report,
        parameters: this.reportParams
      };

      console.log(this.reportSource);

      this.isReady = true;
    });
  }

  ngAfterViewInit() {
    // intercept report refresh fn
    const refreshFn = this.reportViewer.commands.refresh.exec;
    this.reportViewer.commands.refresh.exec = () => {
      console.log('refresh report...');
      ReportsPage.isRefreshing = true;
      refreshFn();
    }
    
  }

  error(e: any, args: any) {
    console.log(e);
    console.log('report error: ', args);
    GlobalErrorHandler.isReportError = true;

    if (ReportsPage.isRefreshing) {
      window.location.reload();
    }
  }

  onRenderEnd() {
    ReportsPage.isRefreshing = false;
  }

  static isRefreshing = false;

}
