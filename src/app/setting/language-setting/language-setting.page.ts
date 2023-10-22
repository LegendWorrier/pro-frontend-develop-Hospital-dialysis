import { LanguageService } from './../../share/service/language.service';
import { Component, OnInit } from '@angular/core';
import { IonNav } from '@ionic/angular';

@Component({
  selector: 'app-language-setting',
  templateUrl: './language-setting.page.html',
  styleUrls: ['./language-setting.page.scss'],
})
export class LanguageSettingPage implements OnInit {

  langList: { id: string; locale: Locale; }[];

  get current() { return this.lang.CurrentLanguage; }

  constructor(private lang: LanguageService, private ionNav: IonNav) { }

  ngOnInit() {
    this.langList = this.lang.getLanguageList();
  }

  isCurrent(id: string) {
    return id === this.current;
  }

  async change(item: { id: string; locale: Locale; }) {
    await this.lang.SetLanguage(item.id);
    this.ionNav.pop();
  }

}
