import { Injectable } from "@angular/core";
import { ServiceBase } from "./service-base";
import { HttpClient } from "@angular/common/http";
import { ServiceURL } from "src/app/service-url";
import { UnitSetting } from "../unit-setting";

@Injectable({
  providedIn: 'root'
})
export class UnitSettingService extends ServiceBase {

  constructor(http: HttpClient) { super(http) }

  getUnitSetting(unitId: number) {
    return this.http.get<UnitSetting>(this.API_URL + ServiceURL.unit_setting.format(unitId.toString()));
  }

  setUnitSetting(unitId: number, setting: UnitSetting) {
    return this.http.post<void>(this.API_URL + ServiceURL.unit_setting.format(unitId.toString()), setting);
  }

}