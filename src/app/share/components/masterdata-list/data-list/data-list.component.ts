import { ServiceBase } from './../../../service/service-base';
import { finalize, first } from 'rxjs/operators';
import { ModalService } from '../../../service/modal.service';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit, Output, TemplateRef, ViewChild, ContentChildren, QueryList, Injector } from '@angular/core';
import { AlertController, IonContent, IonItemSliding, IonList, IonNav, ModalController, NavController, NavParams, Platform } from '@ionic/angular';
import { concat, Observable } from 'rxjs';
import { ModalBack, ModalReturn, handleHttpError, pushOrModal } from 'src/app/utils';

export interface Model {
  [key: string]: any;
  tmp?: Model;
  editing?: boolean;
  adding?: boolean;
}

@Component({
  selector: 'app-data-list',
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss'],
})
export class DataListComponent<T extends Model> implements OnInit, OnDestroy, AfterViewInit {
  @Input() name: string;
  @Input() content: IonContent;
  @Input() minWidth: number;

  @Input() canEdit: boolean = true;

  /**
   * If set to true, this list won't have delete func
   *
   * @memberof DataListComponent
   */
  @Input() noDelete = false;

  /**
   * If provided, use this function to selectively enabled/disabled deletion per each item in the list
   *
   * @memberof DataListComponent
   */
  @Input() deleteCheck: (item: T) => boolean = null;

  /**
   * Sorting func for this list.
   *
   * @memberof DataListComponent
   */
  @Input() sort: (a: T, b: T) => number;
  /**
   *  Custom warning message being alerted when attempt to delete.
   *
   * @type {string}
   * @memberof DataListComponent
   */
  @Input() warning: string;

  /**
   *  Whether this list will have its options
   *  put in front when the screen width is wider. (more than 767px)
   *
   * @memberof DataListComponent
   */
  @Input() desktopVersion = true;
  /**
   * Whether this list will have sliding options behavior or not.
   * (Activated when width is less than 768 px)
   *
   * @memberof DataListComponent
   */
  @Input() mobileVersion = true;
  /**
   *  The edit page component to use instead of in-line editing.
   *
   * @type {*}
   * @memberof DataListComponent
   */
  @Input() editPage: any;
  /**
   *  The add page component to use instead of in-line adding.
   *  If no value given to this, editPage will be used instead.
   *
   * @type {*}
   * @memberof DataListComponent
   */
  @Input() addPage: any;
  /**
   *  Params or props to be sent to the edit/add page.
   *  (Specify the function used to get the props)
   *
   *  The function must handle both adding and editing case.
   *  (in adding case, no item will be passed to the function)
   *
   * @memberof DataListComponent
   */
  @Input('params') getParams: (item?: T) => {[key: string]: any};

  /**
   * In case the data has associated service type, specify it here
   * to auto communicate with the service after saving data.
   *
   * (So that we can update the list)
   *
   * @type {ServiceBase}
   * @memberof DataListComponent
   */
  @Input() dataService: ServiceBase;

  @Input('get') getData: Observable<T[]>;
  @Input('add') addCallback: (args: T) => Observable<any>;
  @Input('edit') editCallback: (args: T) => Observable<any>;
  @Input('delete') deleteCallback: (args: T) => Observable<any>;

  /**
   * This component will act as an add page if there is one.
   * This will prevent auto-load the list on first page load.
   */
  @Input('gotoAdd') gotoAdd: boolean = false;

  /**
   * Preload list. If this is specified, load from this list instead of calling get from server.
   *
   * @type {T[]}
   * @memberof DataListComponent
   */
  @Input() preLoad: T[];
  /**
   * Notify when the list has been updated. (add/edit/delete)
   *
   * @type {EventEmitter<T[]>}
   * @memberof DataListComponent
   */
  @Output() onUpdateList: EventEmitter<T[]> = new EventEmitter<T[]>();

  /**
   * Notify when the user begin editing an item in the list.
   *
   * @type {EventEmitter<T>}
   * @memberof DataListComponent
   */
  @Output() onEdit: EventEmitter<T> = new EventEmitter<T>();
  /**
   * Notify when the user begin adding new item to the list.
   *
   * @type {EventEmitter<void>}
   * @memberof DataListComponent
   */
  @Output() onAdd: EventEmitter<void> = new EventEmitter;
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

  @ViewChild(IonList) list: IonList;

  @ContentChildren('display') displayRef: QueryList<TemplateRef<any>>;
  @ContentChildren('edit') editRef: QueryList<TemplateRef<any>>;

  displayList: TemplateRef<any>[] = [];
  editList: TemplateRef<any>[] = [];

  get Width() { return this.plt.width(); }

  data: T[] = [];
  loading = true;
  networkError = false;

  plt: Platform;
  slideToggle = true;
  addMode = false;

  error: string;
  lastEdit;

  constructor(platform: Platform,
              protected alertCtl: AlertController,
              protected modal: ModalService,
              protected injector: Injector) {
    this.plt = platform;
  }

  ngOnInit(): void {
    if (this.preLoad && this.preLoad.length > 0) {
      setTimeout(() => {
        this.data = this.preLoad;
        this.loading = false;
        this.onUpdateList.emit(this.data);
      });

    }
    else if (!this.gotoAdd) {
      this.loadList();
    }

    if (screen.orientation) {
      screen.orientation.addEventListener('change', () => {
        console.log('orientation changed.');
        this.toggleSlideOption();
      });
    }

    if (!this.addPage) {
      this.addPage = this.editPage;
    }
  }

  loadList() {
    this.getData.pipe(
    finalize(() => this.loading = false))
    .subscribe(
      (data) => {
        console.log('data', data)
        this.data = data.sort(this.sort);
        this.onUpdateList.emit(this.data);
      });
  }

  async ngAfterViewInit(): Promise<void> {
    this.plt.resize.subscribe(() => this.toggleSlideOption());
    this.toggleSlideOption();

    this.displayList.push(...this.displayRef);
    this.editList.push(...this.editRef);

    if (this.gotoAdd && this.addPage) {
      const canGoBack = await this.modal.currentNav.canGoBack();
      const result = await this.addNew();
      const modalCtl = this.injector.get(ModalController);
      const params = canGoBack ? this.injector.get(NavParams) : null;
      ModalReturn(result, { canGoBack, params, modalCtl });
    }
  }

  toggleSlideOption() {
    // Not used anymore
    if (this.plt.width() > 767) {
      this.slideToggle = false;
      this.list?.closeSlidingItems();
    }
    else {
      this.slideToggle = true;
    }
  }

  cancelLastEdit() {
    if (this.lastEdit) {
      this.cancel(this.lastEdit[0], this.lastEdit[1]);
    }
  }

  async editMode(item: T, sliding: IonItemSliding = null) {
    sliding?.close();

    if (this.editPage) {
      const params = this.getParams ? this.getParams(item) : {};
      let result = await pushOrModal(this.editPage, params, this.modal);
      result = result ?? this.dataService?.getTmp();
      if (result) {
        if (result.id === undefined) { // id not set is a marked for deletion
          this.data.splice(this.data.indexOf(item), 1);
        }
        else {
          Object.assign(item, result);
        }
      }
    }
    else {
      this.cancelLastEdit();
      // editmode on
      item.tmp = Object.assign({}, item);
      item.editing = true;

      this.lastEdit = [item, sliding];
    }
    this.onEdit.emit(item);
  }

  canDel(item: T) {
    if (this.deleteCheck) {
      return this.deleteCheck(item);
    }
    return true;
  }

  async delete(item: T, sliding: IonItemSliding) {
    let warning = this.warning ?? `Are you sure to delete this ${this.name}?`;
    const alert = await this.alertCtl.create({
      backdropDismiss: true,
      header: 'Confirmation',
      message: warning,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            sliding?.close();
          }
        }, {
          text: 'Ok',
          handler: () => {
            console.log('Confirm Ok');
            sliding?.close();
            // delete
            this.deleteCallback(item).subscribe(() => {
              this.data.splice(this.data.indexOf(item), 1);
              this.onUpdateList.emit(this.data);
              this.onDelete.emit(item);
            });
          }
        }
      ]
    });
    alert.present();
  }

  add(item: T) {
    this.error = null;
    const data = Object.assign({}, item);
    data.adding = undefined;
    this.addCallback(data).subscribe({
      next: (newItem) => {
        this.data.pop();
        this.data.push(newItem);
        this.onUpdateList.emit(this.data);
        this.onSave.emit(newItem);
      },
      error: (err) => { this.error = handleHttpError(err, this.content); },
      complete: () => {
        this.lastEdit = null;
        this.addMode = false;
      }
    });
  }

  edit(item: T) {
    this.error = null;
    const tmp = item.tmp;
    item.tmp = undefined;

    const data = Object.assign({}, item);
    data.editing = undefined;
    // edit
    this.editCallback(data).subscribe({
      next: () => {
        this.cancelLastEdit();
        this.onUpdateList.emit(this.data);
        this.onSave.emit(item);
      },
      error: (err) => {
        this.error = handleHttpError(err, this.content);
        item.tmp = tmp;
      }
    });
  }

  cancel(item: T, sliding: IonItemSliding = null) {
    this.error = null;
    sliding?.close();

    if (item.tmp) {
      Object.assign(item, item.tmp);
      item.tmp = undefined;
    }

    if (item.adding) {
      this.data.pop();
      this.addMode = false;
    }
    else if (item.editing) {
      item.editing = undefined;
    }

    this.lastEdit = null;
  }

  async addNew() {
    let result;
    if (this.addPage) {
      const params = this.getParams ? this.getParams() : {};
      result = await pushOrModal(this.addPage, params, this.modal);
      console.log(result);
      if (result) {
        this.data.push(result);
        this.data = this.data.sort(this.sort);
        this.onUpdateList.emit(this.data);
      }
      
    }
    else {
      this.cancelLastEdit();

      this.addMode = true;
      const newItem = { adding: true } as T;
      this.data.push(newItem);

      this.lastEdit = [newItem];

      this.content.scrollToBottom();
    }

    this.onAdd.emit();
    return result;
  }

  ngOnDestroy() {
    this.cancelLastEdit();
  }

}
