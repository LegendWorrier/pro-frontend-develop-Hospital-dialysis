import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { UserShift } from '../../user-shift';
import { Unit } from 'src/app/masterdata/unit';
import { GUID } from 'src/app/share/guid';
import { getName } from 'src/app/utils';
import { ShiftSlot, ShiftData } from '../../shift-slot';
import { User } from 'src/app/auth/user';
import { AuthService } from 'src/app/auth/auth.service';
import { isOfflimit, isOtherUnit, isReserved } from '../../shift-utils';
import { Auth } from 'src/app/auth/auth-utils';

@Component({
  selector: 'app-shifts-table',
  templateUrl: './shifts-table.component.html',
  styleUrls: ['./shifts-table.component.scss', '../../../share/excel-btn.scss'],
})
export class ShiftsTableComponent  implements OnInit {

  @Input() colors;

  @Input() isMain: boolean;
  @Input() multiUnit: boolean;
  @Input() isEditable: boolean;
  @Input() unitList: Unit[];

  @Input() data: UserShift[];

  @Input() days: number[];
  @Input() month: Date;

  @Input() allNurseUsers: User[];

  @Output() onExport = new EventEmitter;
  @Output() onSlotSelect = new EventEmitter<[item: UserShift, day: number, slot: ShiftSlot, event: any]>();
  @Output() onGlobalSelect = new EventEmitter<[item: UserShift, event: any]>();

  @ViewChild('container', { read: ElementRef }) container: ElementRef;

  units: number[];

  constructor(private auth: AuthService) { }

  ngOnInit() {
    this.units = Auth.getUserUnits(this.unitList, this.auth);
  }

  getName(userId: string | GUID): string {
    const user = this.allNurseUsers.find(x => x.id === userId);
    return `${getName(user)} (${user.isHeadNurse ? 'Head Nurse' : user.isPN ? 'PN' : 'Nurse'})`;
  }

  isPartTime(userId: string | GUID): boolean {
    const user = this.allNurseUsers.find(x => x.id === userId);
    return user.isPartTime;
  }

  getUnitHead(userId: string | GUID): Unit[] {
    const unitHeads = this.unitList.filter(x => x.headNurse === userId);
    return unitHeads.length > 0 ? unitHeads : null;
  }

  isShiftSelected(no: number, slot: ShiftSlot) {
    const i = this.isMain ? no : no + 3;
    switch (i) {
      case 0:
        return ShiftData.hasFlag(slot.shiftData, ShiftData.Section1);
      case 1:
        return ShiftData.hasFlag(slot.shiftData, ShiftData.Section2);
      case 2:
        return ShiftData.hasFlag(slot.shiftData, ShiftData.Section3);
      case 3:
        return ShiftData.hasFlag(slot.shiftData, ShiftData.Section4);
      case 4:
        return ShiftData.hasFlag(slot.shiftData, ShiftData.Section5);
      case 5:
        return ShiftData.hasFlag(slot.shiftData, ShiftData.Section6);
    }
  }

  isReserved = isReserved;
  isOfflimit = isOfflimit;
  isOtherUnit = isOtherUnit;

  getShiftSlot(userShift: UserShift, day: number): ShiftSlot {
    return userShift.shiftSlots.find(x => new Date(x.date).getDate() === day);
  }

  getUnit(slot: ShiftSlot) {
    const unit = !slot.unitId ? null : this.unitList.find(x => x.id === slot.unitId);
    return unit;
  }

  globalSelect(item: UserShift, event) {
    this.onGlobalSelect.emit([item, event])
  }

  slotSelect(item: UserShift, day: number, slot: ShiftSlot, event) {
    this.onSlotSelect.emit([item, day, slot, event]);
  }

  excel() {
    this.onExport.emit();
  }
}
