import { HttpClient } from "@angular/common/http";
import { getBackendUrl } from "src/app/utils";

export class ServiceBase {

  get API_URL() { return getBackendUrl(); }

  constructor(protected http: HttpClient) {
  }

  protected tmp: any;

  setTmp(data: any) {
    this.tmp = data;
  }

  getTmp(): any {
    const data = this.tmp;
    this.tmp = null;
    return data;
  }
}
