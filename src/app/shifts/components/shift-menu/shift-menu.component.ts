import { ShiftData } from './../../shift-slot';
import { setDate } from 'date-fns';
import { ShiftSelectComponent } from './../shift-select/shift-select.component';
import { PopoverController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { Unit } from 'src/app/masterdata/unit';
import { ModalSearchListComponent, ModalSearchParams } from 'src/app/share/components/modal-search-list/modal-search-list.component';
import { getName } from 'src/app/utils';
import { User } from 'src/app/auth/user';
import { ShiftInfo } from '../../shift-info';

@Component({
  selector: 'app-shift-menu',
  templateUrl: './shift-menu.component.html',
  styleUrls: ['./shift-menu.component.scss'],
})
export class ShiftMenuComponent implements OnInit {
  @Input() infoList: ShiftInfo[];

  @Input() user: User;
  @Input() day: number;
  @Input() unitId: number;
  @Input() unitList: Unit[];
  @Input() globalMode: boolean;

  constructor(private pop: PopoverController) { }

  ngOnInit() {}

  async shift(event) {
    let unitId = this.unitId;
    if (!this.unitId) {
      const unitPrompt = await this.pop.create({
        component: ModalSearchListComponent,
        componentProps: {
          data: this.unitList.filter(x => this.user.units.includes(x.id)),
          getSearchKey: unit => unit.name,
          simpleMode: true,
          title: 'Choose Unit'
        } as ModalSearchParams<Unit>,
        event
      });
      unitPrompt.present();
      const unitResult = await unitPrompt.onWillDismiss();
      if (!unitResult.data) {
        this.pop.dismiss(null, null, 'shift-menu');
        return;
      }
      unitId = unitResult.data.id;
    }
    const shiftPromp = await this.pop.create({
      component: ShiftSelectComponent,
      componentProps: {
        info: this.infoList.find(x => x.unitId === unitId)
      },
      event
    });

    shiftPromp.present();
    const result = await shiftPromp.onWillDismiss();
    if (!result.data) {
      this.pop.dismiss(null, null, 'shift-menu');
      return;
    }

    const shifts = result.data as ShiftData;
    this.pop.dismiss({ unitId, shifts }, 'shift', 'shift-menu');
  }

  reserve() {
    this.pop.dismiss(null, 'reserve', 'shift-menu');
  }

  offlimit() {
    this.pop.dismiss(null, 'offlimit', 'shift-menu');
  }

  suspend() {
    this.pop.dismiss(null, 'suspend', 'shift-menu');
  }

  detail() {
    this.pop.dismiss(null, 'info', 'shift-menu');
  }

  get getName() { return getName(this.user); }

  get getDay() { return setDate(new Date(), this.day); }

}
