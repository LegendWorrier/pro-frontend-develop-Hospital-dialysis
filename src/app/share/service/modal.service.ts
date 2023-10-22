import { Injectable, EventEmitter } from '@angular/core';
import { IonNav, ModalController } from '@ionic/angular';
import { ModalBase } from '../modal-base/modal-base';
import { OverlayEventDetail } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  static currentNavStack: IonNav[] = [];
  static currentData: any;

  get currentNav(): IonNav { return ModalService.currentNavStack[0]; }

  constructor(private modal: ModalController) {}

  async openModal(page, props: {[key: string]: any},
                  classes: string[] = [],
                  onDismiss?: (data: OverlayEventDetail<any>) => void,
                  onWill?: boolean) {
    const navInit = new EventEmitter<IonNav>();

    const modal = await this.modal.create({
      component: ModalBase,
      cssClass: ['modal-panel', ...classes],
      canDismiss: true,
      componentProps: {
        root: page,
        props,
        navInit
      }
    });

    if (onDismiss) {
      if (onWill) {
        modal.onWillDismiss().then(data => onDismiss(data));
      }
      else {
        modal.onDidDismiss().then(data => onDismiss(data));
      }
    }

    navInit.subscribe(data => {
      // add ionNav to the stack
      ModalService.currentNavStack.unshift(data);
    });
    // remove ionNav from the stack
    modal.onWillDismiss().then(() => ModalService.currentNavStack.shift());

    await modal.present();

    return modal;
  }
}
