import { GUID } from 'src/app/share/guid';
import { Component, Input, OnInit } from '@angular/core';
import { checkGuidEmpty } from 'src/app/utils';
import { AuditService } from '../../service/audit.service';

@Component({
  selector: 'audit-name',
  templateUrl: './audit-name.component.html',
  styleUrls: ['./audit-name.component.scss'],
})
export class AuditNameComponent implements OnInit {
  private _id: GUID;
  @Input()
  set id(value: GUID) {
    this._id = value;
    this.isSystem = checkGuidEmpty(this.id);
  }
  get id(): GUID {
    return this._id;
  }
  @Input() date: Date;

  isSystem: boolean;

  constructor(private audit: AuditService) { }

  ngOnInit() {

  }

  auditName() {
    return this.audit.getAuditFullName(this.id);
  }

}
