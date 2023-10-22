import { LanguageService } from './../service/language.service';
import { AuthService } from 'src/app/auth/auth.service';
import { StorageService } from './../service/storage.service';
import { GUID } from './../guid';
import { PageView } from './../page-view';
import { filter, first, mergeMap, take } from 'rxjs/operators';
import { WebSocketService } from './../service/web-socket.service';
import { Injectable } from '@angular/core';
import { Notification, NotiInfo } from './notification';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { differenceInDays, addDays, isEqual, format, isAfter, isFuture, isBefore, endOfDay, isSameDay, parse } from 'date-fns';
import { normalizeDateFromMsgPack } from 'src/app/utils-with-date';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  notificationList: Notification[] = [];

  private total: number = 0;

  get Total(): number { return this.total; }

  get onRead(): Observable<number> {
    return this.read.asObservable();
  }

  get onNotification(): Observable<Notification> {
    return this.newNotification.asObservable();
  }

  get onActionSignal(): Observable<ActionInfo> {
    return this.actionSignal.asObservable();
  }

  get isInit(): boolean {
    return this.init.value;
  }

  get ExceededReadCount(): number {
    return this.exceeded;
  }

  private newNotification: Subject<Notification> = new Subject<Notification>();
  private init: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private read: Subject<number> = new Subject<number>();

  private actionSignal: Subject<ActionInfo> = new Subject<ActionInfo>();

  private lastInGroupMark = new Map<string, GUID>();
  private exceeded: number = 0; // only needed for initial count and offset
  private oldestCount: number; // only needed for initial count and offset
  private oldestKey: string; // only needed for initial count and offset

  constructor(private websocket: WebSocketService, private storage: StorageService, private auth: AuthService, private lang: LanguageService) { 
    websocket.OnConnected.pipe(first()).subscribe(async () => {
      await this.initNotifications();
      lang.OnLanguageChange.subscribe(() => this.initNotifications());
    });

    websocket.setupConnection(con => {
      con.on('Notify', (notiInfo: NotiInfo) => {
        console.log('new notification!', notiInfo);
        
        const lang_key = this.lang.CurrentLanguage;
        
        // replace texts
        const titleValues = notiInfo.Notification.Title.split('::');
        const detailValues = notiInfo.Notification.Detail.split('::');
        notiInfo.Notification.Title = notiInfo.Languages["title_" + lang_key].format(...(titleValues.length > 0 ? titleValues.slice(1) : []));;
        notiInfo.Notification.Detail = notiInfo.Languages["detail_" + lang_key].format(...(detailValues.length > 0 ? detailValues.slice(1) : []));
        notiInfo.Notification.Detail = notiInfo.Notification.Detail.replace(/{(.*)}/, (s, s1) => notiInfo.Languages[s1 + "_" + lang_key]);
        notiInfo.Notification.Title = notiInfo.Notification.Title.replace(/{(.*)}/, (s, s1) => notiInfo.Languages[s1 + "_" + lang_key].capitalizeFirstLetter());

        // handle date time
        notiInfo.Notification = this.processDateInString(normalizeDateFromMsgPack(notiInfo.Notification));

        this.notificationList.unshift(notiInfo.Notification);
        this.total += 1;
        this.newNotification.next(notiInfo.Notification);

        if (!this.oldestKey || this.oldestKey === this.getGroupKey({ notification: notiInfo.Notification })) {
          this.oldestCount++;
        }
      });
    });
  }

  get afterInit() {
    return this.init.pipe(filter((isInit) => isInit), take(1), mergeMap(() => of(this.notificationList)));
  }

  async checkAndFix() {
    const check = await this.websocket.GetOldestNotiCount();
    this.oldestCount = check?.Count ?? 0;
    this.oldestKey = this.oldestCount > 0 ? this.getGroupKey({ expireDate: normalizeDateFromMsgPack(check?.Oldest) }) : null as unknown as string;

    // console.log(check);
    console.log('oldest noti from expire (remove) date:', check?.Oldest);
    console.log('upper limit: ', check?.UpperLimit);
    console.log('oldest on server count: ', this.oldestCount);

    let groups = await this.getReadGroup();
    if (check?.Oldest && groups.length > 0) {
      const target = normalizeDateFromMsgPack(check?.Oldest) as Date;
      groups = groups.filter(x => isSameDay(x.expireDate, target) || isAfter(x.expireDate, target));
      this.saveReadGroup(groups);
    }
  }

  private async initNotifications() {
    console.log('init notification');
    const clearInfo = await this.getClear();
    const result = await this.websocket.GetLatestNotifications();
    console.log(result);
    if (result) {
      this.notificationList = result.Data
        .filter(x => !clearInfo || isAfter(new Date(x.Created), clearInfo.limit))
        .map(x => normalizeDateFromMsgPack(x)) ?? [];
      this.total = result.Total;

      // init read
      const reads = await this.getReads();
      const readGroups = await this.getReadGroup();
      for (const noti of this.notificationList) {
        this.processReadNoti(noti, reads, readGroups);
        // handle date time
        this.processDateInString(noti);
      }
    }
    await this.removeExpire();
    await this.checkAndFix();
    this.init.next(true);
  }

  getLatestNotification(): PageView<Notification> {
    console.log(this.notificationList);
    return {
      data: this.notificationList.slice(0, 5),
      total: this.total
    } as PageView<Notification>;
  }

  async getAllNotification(page: number, limit: number = 15) {
    const max = limit;
    let total = this.total;
    if (this.notificationList.length < max * page) {
      const fetched = await this.websocket.GetNotifications(page, max);
      console.log(fetched);
      const reads = await this.getReads();
      const groups = await this.getReadGroup();
      const clearInfo = await this.getClear();
      if (fetched && clearInfo) {
        fetched.Data = fetched.Data.filter(x => isAfter(new Date(x.Created), clearInfo.limit));
      }
      if (this.notificationList.length < max) {
        let combined = new Map([...fetched?.Data.map(x => this.processDateInString(this.processReadNoti(normalizeDateFromMsgPack(x), reads, groups))) ?? [],
          ...this.notificationList].map(x => [x.Id, x])).values();

        this.notificationList = [...combined];
      }
      else {
        let combined = new Map([...fetched?.Data.map(x => this.processDateInString(this.processReadNoti(normalizeDateFromMsgPack(x), reads, groups))) ?? [],
          ...this.notificationList.slice((page - 1)*max)].map(x => [x.Id, x])).values();

        this.notificationList = this.notificationList.slice(0, (page - 1)*max).concat([...combined]);
      }
      
      if (fetched) {
        total = this.total = fetched.Total;
      }
      
      if ((fetched?.Data.length ?? 0) < max && this.total > max) {
        total = this.notificationList.length;
      }
      
    }

    return {
      data: this.notificationList.slice((page - 1)*max, (page - 1)*max + max),
      total: total
    } as PageView<Notification>;
  }

  async setAsRead(notifications: Notification[]) {
    const newUnreads = notifications.filter(x => !x.isRead);
    newUnreads.forEach(element => {
      const original = this.notificationList.find(x => x.Id === element.Id);
      if (!original) {
        console.error('wrong notification ID!');
      }
      else {
        original.isRead = true;
      }
    });

    if (newUnreads.length === 0) {
      return;
    }

    const notiReads = await this.getReads();
    const newReads = newUnreads.map(x => ({ id: x.Id, expireDate: this.getRemoveDate(x.Created, x.ExpireDate) } as NotiRead));
    notiReads.unshift(...newReads);
    // warning: this may result in wrong state if notification read state got manipulated. (duplicated read)
    
    this.read.next(await this.getUnreadCount(notiReads));

    await this.saveReads(notiReads);
  }

  async setAsReadAndGroupAll(notifications: Notification[]) {
    const readGroups = await this.getReadGroupRaw();
    const reads = await this.getReads();
    const tmp = new Map<string, { last: GUID, read: boolean, count: number }>();
    
    for (const element of notifications) {
      const noti = element;
      noti.isRead = true;
      const key = this.getGroupKey({notification: noti}); // group on day-to-day basis
      let value = readGroups.get(key) ?? [0, '' as GUID];
      let totalRead = value[0]
      if (!tmp.has(key)) { // first occurrence, will be last in group mark
        if (!readGroups.has(key)) {
          tmp.set(key, { last: undefined as unknown as GUID, read: false, count: 0 });
        }
        else {
          tmp.set(key, { last: value[1], read: false, count: 0 });
        }
        value[1] = noti.Id;
        this.lastInGroupMark.set(key, noti.Id);
      }

      const check = tmp.get(key);
      if (check && check.last === noti.Id) {
        check.read = true;
        tmp.set(key, check);
      }
      if (check && check.read) {
        check.count++;
      }
      
      if (!check || !check.read || check.count > totalRead) {
        value[0] += 1;
        readGroups.set(key, value);
        const index = reads.findIndex(x => x.id === noti.Id);
        if (index > -1) {
          reads.splice(index, 1);
        }
        if (check?.read) {
          check.read = false;
        }
      }
    }
    
    const  currentCount = await this.getUnreadCount(reads, this.processReadGroupMap(readGroups));
    console.log('count after group read: ', currentCount);
    this.read.next(currentCount);

    await this.saveReads(reads);
    await this.saveReadGroupRaw(readGroups);
  }

  async getUnreadCount(reads?: NotiRead[], groups?: NotiReadGroup[]) {
    reads = reads ?? await this.getReads();
    groups = groups ?? await this.getReadGroup();

    
    let unreadCount = this.total - reads.length - groups.reduce((p, c) => c.count + p, 0);
    this.exceeded = unreadCount < 0 ? -unreadCount : 0;
    unreadCount = Math.max(0, unreadCount);
    
    if (groups.length > 0) {
      console.log('exceed: ', this.exceeded);
      const oldestGroup = groups.reduce((p, c) => isBefore(c.expireDate, p.expireDate) ? c : p);
      console.log('oldest read count: ', oldestGroup.count);
      if (this.oldestKey && this.getGroupKey({expireDate: oldestGroup.expireDate}) !== this.oldestKey) {
        this.oldestCount = 0;
      }
      const diff = oldestGroup.count - this.oldestCount;
      if (this.exceeded > 0 || diff > 0) {
        const moreUnread = Math.abs(this.exceeded - diff);
        unreadCount += Math.max(0, moreUnread);
      }
    }

    // self-heal logic: always check first 5 records, just in case
    if (unreadCount === 0) {
      let newUnread = 0;
      const count = Math.min(5, this.notificationList.length);
      for (let i = 0; i < count; i++) {
        const noti = this.notificationList[i];
        if (!noti.isRead) {
          newUnread++;
          console.log('self-heal');
        }
      }
      unreadCount += newUnread;
    }

    return unreadCount;
  }

  async clearAll(pageLimit: number = 15) {
    await this.fetchAllRemaining(pageLimit, { total: 0, limit: null as unknown as Date });
    console.log('all noti', this.notificationList);
    await this.setAsReadAndGroupAll(this.notificationList);
    
    const limit = new Date();
    const clear = { limit: limit, total: this.total } as NotiClear;
    await this.saveClear(clear);

    this.notificationList = this.notificationList.filter(x => new Date(x.Created) > limit);

    this.read.next(await this.getUnreadCount());
  };

  async fetchAllRemaining(limit: number = 15, clearInfo?: NotiClear) {
    clearInfo = clearInfo ?? await this.getClear();
    const total = this.total - (clearInfo?.total ?? 0);
    if (total <= this.notificationList.length) {
      console.log('already got all item');
      return [];
    }
    const start = Math.floor(this.notificationList.length / limit) + 1;
    const last = Math.ceil(total / limit);
    const count = last - start + 1;
    const result = await Promise.all(Array.from({length: count }, (v, k) => this.websocket.GetNotifications(k + start, limit)));
    const reduce = result.reduce((p: Notification[], c) => p.concat(c?.Data ?? []), []);
    console.log('fetch all remaining result', reduce);

    if (this.notificationList.length < limit) {
      let combined = new Map([...reduce.map(x => this.processDateInString(normalizeDateFromMsgPack(x))) ?? [],
        ...this.notificationList].map(x => [x.Id, x])).values();

      this.notificationList = [...combined];
    }
    else {
      let combined = new Map([...reduce.map(x => this.processDateInString(normalizeDateFromMsgPack(x))) ?? [],
        ...this.notificationList.slice((start - 1)*limit)].map(x => [x.Id, x])).values();

      this.notificationList = this.notificationList.slice(0, (start - 1)*limit).concat([...combined]);
    }

    return reduce;
  }

  SignalAction(info: ActionInfo) {
    this.actionSignal.next(info);
  }

  // ============= Utils ===================

  private processReadNoti(notification: Notification, reads: NotiRead[], groups: NotiReadGroup[]) {
    if (reads.map(x => x.id).includes(notification.Id)) {
      notification.isRead = true;
      return notification;
    }
    const key = this.getGroupKey({ notification });
    const currentGroup = groups.find(x => isEqual(new Date(key), x.expireDate));
    if (currentGroup && (this.lastInGroupMark.has(key) || notification.Id === currentGroup.lastInGroup)) {
      if (notification.Id === currentGroup.lastInGroup) {
        this.lastInGroupMark.set(key, notification.Id);
      }
      notification.isRead = true;
    }
    return notification;
  }

  private processDateInString(notification: Notification) {
    notification.Detail = notification.Detail.replace(/\$d\[(.*?)\](?::\[(.*?)\])?/, (s, s1, s2) =>{
      // console.log('s1', s1);
      // console.log('s2', s2);
      return format(new Date(s1), s2 ?? 'd MMM, hh:mm a', { locale: this.lang.CurrentDateLocale });
    });
    
    return notification;
  }

  private getRemoveDate(createdDate: Date, expireDate: Date) {
    // backend server has minimum keeping period of 1 week for each notification.
    const created = new Date(createdDate);
    const targetExpire = new Date(expireDate);
    const diff = differenceInDays(targetExpire, created);
    return diff < 7 ? addDays(created, 7) : targetExpire;
  }

  // We need to group based on remove date so that it can be purged altogether.
  private getGroupKey(arg: {notification?: Notification, expireDate?: Date}) {
    const expire = arg.notification ? this.getRemoveDate(arg.notification.Created, arg.notification.ExpireDate) : arg.expireDate;
    return format(expire, 'yyyy-MM-dd');
  }

  private async getReads() {
    return (await this.storage.get('noti-reads:' + this.auth.currentUser.id)) as NotiRead[] ?? [];
  }

  private async getReadGroupRaw() {
    const raw = (await this.storage.get('noti-read-group:' + this.auth.currentUser.id)) as Map<string, [number, GUID]> ?? new Map<string, [number, GUID]>();
    return raw;
  }

  private async getReadGroup() {
    const raw = await this.getReadGroupRaw();
    return this.processReadGroupMap(raw);
  }

  private processReadGroupMap(groups: Map<string, [number, GUID]>): NotiReadGroup[] {
    // const result = [] as NotiReadGroup[];
    return Array.from(groups).map(x => ({ expireDate: new Date(x[0]), count: x[1][0], lastInGroup: x[1][1] } as NotiReadGroup));
    // for (const item of groups.entries()) {
    //   result.push({
    //     expireDate: item[0],
    //     count: item[1]
    //   } as NotiReadGroup);
    // }
    // return result;
  }

  private async saveReads(reads: NotiRead[]) {
    await this.storage.set('noti-reads:' + this.auth.currentUser.id, reads);
  }

  private async saveReadGroupRaw(reads: Map<string, [number, GUID]>) {
    await this.storage.set('noti-read-group:' + this.auth.currentUser.id, reads);
  }

  private async saveReadGroup(reads: NotiReadGroup[]) {
    await this.saveReadGroupRaw(new Map(reads.map(x => [this.getGroupKey({expireDate: x.expireDate}), [x.count, x.lastInGroup]])));
  }

  private async removeExpire() {
    const reads = await this.getReads();
    const groups = await this.getReadGroup();
    
    this.saveReads(reads.filter(x => isFuture(x.expireDate)));
    // group read is an estimated delete time, so we delay them for 1 whole day
    const adjustedGroups = groups.filter(x => isFuture(endOfDay(x.expireDate)));
    this.saveReadGroup(adjustedGroups);

    const clearInfo = await this.getClear();
    if (clearInfo) {
      clearInfo.total -= groups.length - adjustedGroups.length;
      await this.saveClear(clearInfo);
    }
  }

  private async getClear() {
    return await this.storage.get('noti-clear:' + this.auth.currentUser.id) as NotiClear;
  }

  private async saveClear(clear: NotiClear) {
    await this.storage.set('noti-clear:' + this.auth.currentUser.id, clear);
  }

  async resetReads() {
    await this.storage.remove('noti-reads:' + this.auth.currentUser.id);
    await this.storage.remove('noti-read-group:' + this.auth.currentUser.id);
    await this.storage.remove('noti-clear:' + this.auth.currentUser.id);
    console.log('remove reads');
  }
  
}

export interface NotiRead {
  id: GUID;
  expireDate: Date;
}

export interface NotiReadGroup {
  count: number;
  expireDate: Date;

  lastInGroup: GUID;
}

export interface NotiClear {
  limit: Date;
  total: number;
}

export interface ActionInfo {
  target: string,
  params?: { [key:string]: any }
}
