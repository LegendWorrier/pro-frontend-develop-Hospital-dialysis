import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AlertController, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { PageView } from '../../page-view';

@Component({
  selector: 'app-page-loader',
  templateUrl: './page-loader.component.html',
  styleUrls: ['./page-loader.component.scss'],
})
export class PageLoaderComponent<T> implements OnInit {

  @Input() label: string;
  @Input() dataList: T[];
  @Output() dataListChange: EventEmitter<T[]> = new EventEmitter<T[]>();
  @Input() loadCall: (page: number, limit: number, where?: string) => Observable<PageView<T>>;
  /**
   * Whether the list is auto refresh if detect modified.
   *
   * @type {boolean}
   * @memberof PageLoaderComponent
   */
  @Input() autoRefresh: boolean;
  /**
   * Whether there is retry button when loading error occur.
   *
   * @type {boolean}
   * @memberof PageLoaderComponent
   */
  @Input() retryable: boolean;
  @Input() threshold = 300;
  @Input() filter: string;

  /**
   * How many items per page / per loading
   *
   * @type {number}
   * @memberof PageLoaderComponent
   */
  @Input() limit: number = 50;

  total: number;
  private firstTotal: number;
  displayRetry: boolean;
  isLoading: boolean;

  isTotal: boolean;

  // If true, this is the first load
  firstLoad = true;
  @Output() firstLoadEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() onLoadFinish = new EventEmitter<T[]>();

  nextPage = 1;

  @ViewChild('infiniteScroll') infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonInfiniteScrollContent) content: IonInfiniteScrollContent;

  constructor(private alertCtl: AlertController, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.initLoad();
  }

  _sub: Subscription;
  initLoad() {
    this.cancelLoad();
    return new Promise<void>((resolve) => {
      this.isTotal = false;
      if (this.infiniteScroll) {
        (this.infiniteScroll as any)._highestY = 0;
        (this.infiniteScroll as any)._lastCheck = 0;
      }
      console.log('loading page..........');
      this.firstLoad = true;
      this._sub = this.loadPage()
        .pipe(finalize(() => {
          this.firstLoad = false;
          this.firstLoadEvent.emit(this.firstLoad);
        }))
        .subscribe({
          next: (data) => {
            this.setData(data);
            this.firstTotal = this.total;
            if (this.total === this.dataList.length) {
              this.isTotal = true;
            }
            resolve();
          }
        });
    });
  }

  cancelLoad() {
    if (this._sub && !this._sub.closed) {
      console.log('cancel previous load');
      this._sub.unsubscribe();
    }
    this._sub = undefined;
  }

  setData(data: PageView<T>) {
    this.dataList = [...(this.dataList ?? []), ...data.data];
    this.total = data.total;
    this.dataListChange.emit(this.dataList);
    this.onLoadFinish.emit(this.dataList);
  }

  loadPage() {
    this.isLoading = true;
    this.nextPage = Math.floor((this.dataList?.length / this.limit) + 1);
    return this.loadCall(this.nextPage, this.limit, this.filter).pipe(finalize(() => this.isLoading = false));
  }

  async loadData() {
    if (this.dataList.length < this.total) {
      this.cancelLoad();
      this._sub = this.loadPage().subscribe({
        next: async (data) => {
          this.infiniteScroll.complete();
          this.setData(data);
          if (this.autoRefresh && this.firstTotal !== this.total) {
            const alert = await this.alertCtl.create({
              backdropDismiss: false,
              header: 'Data Changed',
              message: `The ${this.label} list has been modified. The page will auto refresh.`,
              buttons: [
                {
                  text: 'OK',
                  role: 'ok',
                  handler: () => {
                    window.location.reload();
                  }
                }
              ]
            });
            alert.present();
          }
        },
        error: (err) => {
          this.infiniteScroll.disabled = true;
          if (this.retryable) {
            this.displayRetry = true;
          }
          throw err;
        }
      });
    }
    else {
      this.isTotal = true;
      this.cdr.detectChanges();
    }
  }

  get LoadingLabel(): string {
    return `Loading ${this.label}...`;
  }

  async reload(clear: boolean = false) {
    if (clear) {
      this.dataList = [];
      // this.dataListChange.emit(this.dataList);
      await this.initLoad();
    }
    else {
      this.displayRetry = false;
      this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
      await this.loadData();
    }
  }

}
