import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { RoleInfo } from 'src/app/auth/role-info';
import { ModalService } from 'src/app/share/service/modal.service';
import { PermissionService } from 'src/app/share/service/permission.service';
import { RoleDetailPage } from './role-detail/role-detail.page';
import { pushOrModal } from 'src/app/utils';

@Component({
  selector: 'app-role-setting',
  templateUrl: './role-setting.page.html',
  styleUrls: ['./role-setting.page.scss'],
})
export class RoleSettingPage implements OnInit {

  data: RoleInfo[];

  loading = true;
  networkError = false;

  constructor(private permissionService: PermissionService, private modal: ModalService) { }

  ngOnInit() {
    this.loadList();
  }

  loadList() {
    this.permissionService.getAllRoles().pipe(
      finalize(() => this.loading = false))
    .subscribe(
      (data) => {
        console.log('data', data)
        this.data = data;
      });
  }

  async roleDetail(role: RoleInfo) {
    let result = await pushOrModal(RoleDetailPage, { role }, this.modal);
    result = result ?? this.permissionService?.getTmp();
    if (result) {
      if (result.id === undefined) { // id not set is a marked for deletion
        this.data.splice(this.data.indexOf(role), 1);
      }
      else {
        Object.assign(role, result);
      }
    }
  }

  async addRole() {
    let result = await pushOrModal(RoleDetailPage, {}, this.modal);
    result = result ?? this.permissionService?.getTmp();
    if (result) {
      this.data.push(result);
    }
  }

}
