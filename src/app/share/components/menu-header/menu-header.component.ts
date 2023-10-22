import { firstValueFrom } from 'rxjs';
import { AfterContentInit, Component } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { AuthService } from 'src/app/auth/auth.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-menu-header',
  templateUrl: './menu-header.component.html',
  styleUrls: ['./menu-header.component.scss'],
})
export class MenuHeaderComponent implements AfterContentInit {
  centerName: string;
  isHospital: boolean;

  get username(): string { return this.auth.currentUser?.userName; }

  get width() { return this.plt.width(); }

  constructor(private auth: AuthService, private plt: Platform) { }

  ngAfterContentInit(): void {
    this.loadData();
    this.auth.currentUserUpdate.subscribe(async () => {
      const loggedIn = await firstValueFrom(this.auth.isAuthenticated());
      if (loggedIn) {
        this.loadData();
      }
    });
    AppConfig.configWatch.subscribe(() => this.loadData());
  }

  loadData() {
    this.centerName = AppConfig.config?.centerName;
    this.isHospital = AppConfig.config?.centerType === 'hospital';
  }

}
