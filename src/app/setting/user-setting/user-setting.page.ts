import { getName } from 'src/app/utils';
import { Component, OnInit } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { User } from 'src/app/auth/user';
import { UserService } from 'src/app/auth/user.service';
import { Roles } from 'src/app/enums/roles';
import { UserDetailPage } from './user-detail/user-detail.page';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-setting',
  templateUrl: './user-setting.page.html',
  styleUrls: ['./user-setting.page.scss'],
})
export class UserSettingPage implements OnInit {
  getDataList: Observable<User[]>;
  // deleteData: (item: User) => Observable<void>;
  editPage = UserDetailPage;

  get getParams() {
    return (item?: User) => {
      if (item) {
        return { user: item };
      }

      return { addMode: true };
    };
  }

  users: User[];

  iconMap = {
    Doctor : 'doctor',
    Nurse : 'nurse',
    PowerAdmin : 'user-shield'
  };

  constructor(public userService: UserService, private nav: IonNav) {
    this.getDataList = this.userService.getAllUser();
    // this.deleteData = (item) => this.userService.deleteUser(item);
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
  }

  get sorting() {
    return (a, b) =>
    {
      if (a.isPowerAdmin) {
        return -1;
      }
      if (a.isAdmin && !b.isAdmin) {
        return -1;
      }
      if (b.isPowerAdmin) {
        return 1;
      }
      if (b.isAdmin && !a.isAdmin) {
        return 1;
      }
      return a.userName.localeCompare(b.userName);
    };
  }

  mapIcon(role: string) {
    switch (role) {
      case Roles.Doctor:
        return this.iconMap.Doctor;
      case Roles.HeadNurse:
      case Roles.Nurse:
      case Roles.PN:
        return this.iconMap.Nurse;
      default:
        return this.iconMap.PowerAdmin;
    }
  }

  fullName(user: User) {
    return getName(user);
  }

}
