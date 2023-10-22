import { LanguageService } from './language.service';
import { NotiResult } from './../Notification/notification';
import { DialysisRecordInfo } from 'src/app/dialysis/dialysis-record';
import { PatientInfo } from 'src/app/patients/patient-info';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { BedBox } from './../../monitor/bed-box';
import { AuthService } from 'src/app/auth/auth.service';
import { AppConfig } from 'src/app/app.config';
import { Injectable } from '@angular/core';
import * as Signalr from '@microsoft/signalr';
import * as Signalr_msgpack from '@microsoft/signalr-protocol-msgpack'
import { AlertInfo } from 'src/app/monitor/alert-info';
import { first, filter } from 'rxjs/operators';
import { PatientBasicInfo } from 'src/app/monitor/patient-basic-info';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private connection: Signalr.HubConnection;

  private connecting = new BehaviorSubject<boolean>(false);
  get OnConnected() { return this.connecting.asObservable().pipe(filter(x => !!x)); }

  get IsConnect() { return this.connection?.state === Signalr.HubConnectionState.Connected }

  constructor(private auth: AuthService, private lang: LanguageService) {
    this.auth.onLoggedInOrRefresh.subscribe(() => {
      if (!this.IsConnect) {
        this.startServerConnection();
      }
    });
  }

  async startServerConnection(): Promise<boolean> {
    if (this.IsConnect) {
      return true;
    }
    if (!this.connection) {
      await this.initConnection();
    }
    
    if (this.connection.state === Signalr.HubConnectionState.Disconnecting) {
      return false;
    }
    else if (this.connection.state !== Signalr.HubConnectionState.Disconnected) {
      console.log('[WebSocket] waiting for connection...');
      await firstValueFrom(this.OnConnected);
      console.log('[WebSocket] connected!');
      return false;
    }

    try {
      await this.connection.start();
      console.log("[WebSocket] Server Connected.");
      this.connecting.next(true);
      return true;

    } catch (err) {
      console.log(err);
    }
    return false;
  };

  private async initConnection() {
    const config = await firstValueFrom(AppConfig.configWatch.pipe(first(x => !!x)));
    this.connection = new Signalr.HubConnectionBuilder()
      .withUrl(config.apiServer + "/connect", {
        accessTokenFactory: async () => await firstValueFrom(this.auth.getToken())
      })
      .configureLogging(Signalr.LogLevel.Information)
      .withAutomaticReconnect()
      .withHubProtocol(new Signalr_msgpack.MessagePackHubProtocol())
      .build();

    this.connection.serverTimeoutInMilliseconds = 15000;

    this.connection.onclose(async () => {
      console.log('[WebSocket] connection close.');
    });

    this.connection.onreconnecting((e) => {
      console.error('[WebSocket]', e);
      console.log('[WebSocket] connection lost. reconnecting...');
    });

    this.connection.onreconnected(() => {
      console.log('[WebSocket] Reconnected to server.');
      this.connecting.next(true);
    });
  }

  setupConnection(setup: (conn: Signalr.HubConnection) => void) {
    if (!this.connection || !this.IsConnect) {
      this.OnConnected.pipe(first()).subscribe(() => {
        setup(this.connection);
      });
    }
    else {
      setup(this.connection);
    }
  }

  async getMonitorList(): Promise<BedBox[]> {
    if (!this.IsConnect) {
      return null;
    }
    const result: BedBox[] = await this.connection.invoke("GetMonitorList");
    console.log('monitor list', result);
    return result;
  }

  async getAlertRecords(): Promise<{ [macAddress: string]: AlertInfo[]; }> {
    if (!this.IsConnect) {
      return null;
    }
    const result: { [macAddress: string]: AlertInfo[] } = await this.connection.invoke("GetAlertRecords");
    console.log('alert records', result);
    return result;
  }

  changeBedName(bed: BedBox, newname: string) {
    if (!this.IsConnect) {
      return;
    }
    this.connection.invoke("ChangeBedName", bed.MacAddress, newname);
  }

  changeBoxState(bed: BedBox) {
    if (!this.IsConnect) {
      return;
    }
    this.connection.invoke("ChangeBoxState", bed.MacAddress);
  }

  async complete(bed: BedBox): Promise<boolean> {
    if (!this.IsConnect) {
      return false;
    }
    return await this.connection.invoke("Complete", bed.MacAddress);
  }

  pickPatient(bed: BedBox, patientId: string) {
    if (!this.IsConnect) {
      return;
    }
    return this.connection.invoke<PatientBasicInfo>("PickPatient", bed.MacAddress, patientId);
  }

  async getData(req: { bed?: BedBox, patient?: PatientInfo }) {
    if (!this.IsConnect) {
      return;
    }
    
    return await this.connection.invoke<DialysisRecordInfo>("GetData", { PatientId: req.patient?.id, MacAddress: req.bed?.MacAddress });
  }

  // =========== Notification ================

  async GetLatestNotifications() {
    if (!this.IsConnect) {
      return;
    }
    const lang_key = this.lang.CurrentLanguage;
    return await this.connection.invoke<NotiResult>('GetLatestNotifications', lang_key);
  }

  async GetNotifications(page: number, max: number) {
    if (!this.IsConnect) {
      return;
    }
    const lang_key = this.lang.CurrentLanguage;
    return await this.connection.invoke<NotiResult>('GetNotifications', page, max, lang_key);
  }

  async GetOldestNotiCount() {
    if (!this.IsConnect) {
      return;
    }
    return await this.connection.invoke<{ Oldest: Date, UpperLimit: Date, Count: number }>('GetOldestNotiCount');
  }

}
