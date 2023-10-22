import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { NotificationService } from 'src/app/share/Notification/notification.service';

@Component({
  selector: 'app-notification-setting',
  templateUrl: './notification-setting.page.html',
  styleUrls: ['./notification-setting.page.scss'],
})
export class NotificationSettingPage implements OnInit {

  constructor(private noti: NotificationService, private alertCtl: AlertController) { }

  ngOnInit() {
  }

  async resetNoti() {
    this.noti.resetReads();
    const alert = await this.alertCtl.create({
      header: 'Done!',
      subHeader: 'Successfully reset.',
      message: 'The app will need to be restarted to take effect. Would you like to restart now?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Restart now',
          handler: () => {
            window.location.reload();
          }
        },
        {
          text: 'Wait',
          handler: () => alert.dismiss()
        }
      ]
    });
    await alert.present();
  }
}
