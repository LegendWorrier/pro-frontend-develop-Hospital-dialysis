import { Observable, firstValueFrom } from 'rxjs';
import { Component, ContentChild, ContentChildren, EventEmitter, Injector, Input, OnInit, Output, QueryList, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { IonContent, IonNav, AlertController, NavParams } from '@ionic/angular';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Stockable } from 'src/app/masterdata/stockable';
import { addOrEdit, presentToast, ToastType, onLeavePage } from 'src/app/utils';
import { ImageAndFileUploadService } from 'src/app/share/service/image-and-file-upload.service';

@Component({
  selector: 'app-stockable-detail',
  templateUrl: './stockable-detail.page.html',
  styleUrls: ['./stockable-detail.page.scss'],
})
export class StockableDetailPage<T extends Stockable> implements OnInit, AfterViewInit {
  @Input() stockable: T;

  @Input() name: string;

  @Input() addCall: (item: T) => Observable<T>;
  @Input() editCall: (item: T) => Observable<void>;
  @Input() deleteCall: (item: T) => Observable<void>;
  @Input() beforeSave: (item: T) => boolean;

  @Input() canEdit: boolean = true;
  
  /**
   * Notify when an item has been save. (added or edited)
   *
   * @type {EventEmitter<T>}
   * @memberof DataListComponent
   */
  @Output() onSave: EventEmitter<T> = new EventEmitter<T>();
  /**
   * Notify when an item has been deleted.
   *
   * @type {EventEmitter<T>}
   * @memberof DataListComponent
   */
  @Output() onDelete: EventEmitter<T> = new EventEmitter<T>();

  tmp: Stockable;

  editMode: boolean;
  error: string;

  hasBarcode: boolean;
  src: string;
  image: { path: string, data: Blob, name: string };

  @ViewChild(IonContent) content: IonContent;
  @ContentChildren('detail') detailRef: QueryList<TemplateRef<any>>;
  @ContentChild('extra') extraRef: TemplateRef<any>;
  detailList: TemplateRef<any>[] = [];
  extra: TemplateRef<any>;

  markForUpdate: boolean;

  constructor(
    protected masterdata: MasterdataService,
    protected injector: Injector,
    protected nav: IonNav,
    protected navParam: NavParams,
    protected alertCtl: AlertController,
    protected img: ImageAndFileUploadService
    ) { }

  ngAfterViewInit(): void {
    this.detailList.push(...this.detailRef);
    this.extra = this.extra ?? this.extraRef;
  }

  ngOnInit() {
    if (this.stockable) {
      this.editMode = true;
      this.tmp = Object.assign({}, this.stockable);
    }
    else {
      this.tmp = { id: 0, name: null, code: null, note: null };
    }

    if (this.tmp.barcode) {
      this.hasBarcode = true;
    }

    if (this.tmp.image) {
      this.img.getImageOrFile(this.tmp.image).subscribe({
        next: (data) => {
          if (data) {
            const url = window.URL.createObjectURL(data);
            this.src = url;
          }
        },
        error: (err) => {
          if (err.status === 404) {
            return;
          }
          throw err;
        }
      });
    }

  }

  async chooseImage() {
    const data = await this.img.selectPicture();
    if (data) {
      this.image = data;
      this.src = this.image.path;
    }
  }

  async save() {

    if (this.beforeSave && !this.beforeSave(this.tmp as T)) {
      return;
    }

    if (this.image) {
      let errorUpload = false;
      const result = await firstValueFrom(this.img.uploadImageOrFile(this.image.data, this.image.name, this.tmp.image)).catch(err => {
        console.log(err);
        errorUpload = true;
      });
      if (errorUpload || !result) {
        this.error = "Cannot upload the image. Please try again."
        return;
      }
      
      this.tmp.image = result[0];
    }

    const $callToServer = this.editMode ?
        this.editCall(this.tmp as T) :
        this.addCall(this.tmp as T);
    addOrEdit(this.injector, {
      addOrEditCall: $callToServer,
      successTxt: {
        name: this.name,
        editMode: this.editMode
      },
      isModal: true,
      errorCallback: (err) => {
        this.error = err;
      },
      content: this.content,
      successCallback: (data) => {
        if (data) {
          this.tmp = data;
        }
        this.masterdata.setTmp(this.tmp);
        this.onSave.emit(this.tmp as T);
      },
      completeCallback: () => this.error = null
    });
  }

  async delete() {
    const alert = await this.alertCtl.create({
      header: 'Confirmation',
      message: `Are you sure to delete this ${this.name.toLowerCase()}? (All stock data will be gone forever)`,
      buttons: [
        { text: 'Cancel' },
        { text: 'Ok', role: 'ok' }
      ]
    });
    alert.present();

    const result = await alert.onWillDismiss();
    if (result.role !== 'ok') {
      return;
    }

    this.deleteCall(this.tmp as T).subscribe(() => {
      presentToast(this.injector, {
        header: 'Deleted',
        message: `${this.name} deleted`,
        type: ToastType.alert
      });
      this.onDelete.emit(this.tmp as T);
      this.markForUpdate = true;
      this.stockable.id = undefined;
      this.nav.pop();
    });
  }

  ionViewWillLeave() {
    let passing = null;
    if (this.markForUpdate) {
      passing = this.stockable;
    }
    onLeavePage(passing, this.navParam);
  }

}
