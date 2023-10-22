import { PopoverController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { PopupMenuComponent } from '../components/popup-menu/popup-menu.component';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor(private popup: PopoverController) { }

  async openPopupMenu(menuList: { display: string, name: string, disable?: boolean }[], event?) {
    const menu = await this.popup.create({
      component: PopupMenuComponent,
      componentProps: {
        menuList
      },
      event
    });
    menu.present();
    const result = await menu.onWillDismiss();

    if (result.role !== 'ok') {
      return null;
    }

    return result.data;
  }
}
