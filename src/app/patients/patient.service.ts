import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { differenceInMinutes, differenceInYears } from 'date-fns';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GUID } from 'src/app/share/guid';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { CoverageSchemeType } from '../enums/coverage-scheme-type';
import { ServiceURL } from '../service-url';
import { ServiceBase } from '../share/service/service-base';
import { getEnumKeyByValue } from '../utils';
import { BloodSign, BloodType, Patient } from './patient';
import { PatientList } from './patient-list';
import { PatientInfo } from './patient-info';
import { PatientRules } from './patient-rule';
import { PatientHistory } from './patient-history';

@Injectable({
  providedIn: 'root'
})
export class PatientService extends ServiceBase {

  constructor(http: HttpClient) {
    super(http);
  }

  protected tmp: Patient;

  static processReadData(patient: Patient): Patient {
    if (patient.bloodType) {
      const split = patient.bloodType.split('-');
      patient.blood = BloodType[split[0]];
      if (split.length > 1) {
        patient.bloodSign = BloodSign[split[1]];
      }
    }
    if (!patient.dialysisInfo) {
      patient.dialysisInfo = { status: null, causeOfKidneyDisease: null };
    }
    if (!patient.emergencyContact) {
      patient.emergencyContact = { name: null, phoneNumber: null, relationship: null };
    }

    return patient;
  }

  static processWriteData(patient: Patient) {
    if (patient.blood !== undefined) {
      const bloodType = BloodType[patient.blood];
      if (patient.blood === BloodType.Unknown) {
        patient.bloodSign = null;
      }
      if (patient.bloodSign) {
        const bloodSign: string = getEnumKeyByValue(BloodSign, patient.bloodSign);
        patient.bloodType = bloodType.concat('-', bloodSign);
      }
      else {
        patient.bloodType = bloodType;
      }
    }
  }

  getAllPatient(page: number, limit?: number, orderBy?: string[], doctorId?: GUID, where?: string): Observable<PatientList> {
    let params = new HttpParams({ fromObject: { page: `${page}` } });
    if (limit) {
      params = params.set('limit', `${limit}`);
    }

    if (doctorId) {
      params = params.set('doctorId', `${doctorId}`);
    }

    if (orderBy) {
      orderBy.forEach(item => {
        params.append('orderBy', item);
      });
    }

    if (where) {
      params = params.set('where', where);
    }

    return this.http.get<PatientList>(this.API_URL + ServiceURL.patient_getall, { params });
  }

  getAllPatientByUnit(unitId: number, page: number = 1, limit: number = 1000): Observable<PatientList> {
    const params = new HttpParams({ fromObject: { page: `${page}`, limit: `${limit}` } });
    return this.http.get<PatientList>(this.API_URL + ServiceURL.patient_getall_unit.format(unitId.toString()), { params });
  }

  getPatient(id: string): Observable<Patient> {
    return this.http.get<PatientInfo>(this.API_URL + ServiceURL.patient_get.format(encodeURIComponent(id))).pipe(map(PatientService.processReadData));
  }

  getPatientHistory(id: string) {
    return this.http.get<PatientHistory[]>(this.API_URL + ServiceURL.patient_history.format(encodeURIComponent(id)));
  }

  addPatient(patient: Patient): Observable<any> {
    PatientService.processWriteData(patient);
    console.log(patient);
    return this.http.post(this.API_URL + ServiceURL.patient_addnew, patient);
  }

  updatePatient(id: string, patient: Patient): Observable<any> {
    PatientService.processWriteData(patient);
    console.log(patient);
    return this.http.post(this.API_URL + ServiceURL.patient_edit.format(encodeURIComponent(id)), patient);
  }

  updatePatientHistory(id: string, entries: PatientHistory[]) {
    return this.http.post<void>(this.API_URL + ServiceURL.patient_history.format(encodeURIComponent(id)), [...entries]);
  }

  deletePatient(id: string): Observable<any> {
    return this.http.delete(this.API_URL + ServiceURL.patient_delete.format(encodeURIComponent(id)));
  }

  setTmp(p: Patient) {
    this.tmp = PatientService.processReadData(p);
    PatientService.processWriteData(this.tmp);
  }

  getTmp(): Patient {
    const p = this.tmp;
    this.tmp = null;
    return p;
  }

  getRule() {
    return this.http.get<PatientRules>(this.API_URL + ServiceURL.patient_setting);
  }

  setRule(request: PatientRules) {
    return this.http.put<void>(this.API_URL + ServiceURL.patient_setting, request);
  }

  // =========================== Get All Patients By Unit =========================
  // ===== caches =========
  private allPatients: { [unitId: number]: { list: PatientInfo[], lastUpdate: Date } } = {};
  private forceReloadPatientList: boolean;
  private readonly cacheTime = 20;

  public forceRefreshCache() {
    this.forceReloadPatientList = true;
  }

  public getLastCacheUpdate(unitId: number) { return this.allPatients[unitId]?.lastUpdate; }

  public getAccumulatedPatientByUnit(unitId: number) {
    return new Observable<PatientInfo[]>((sub) => {
      const cached = this.allPatients[unitId];
      if (this.forceReloadPatientList || !cached || differenceInMinutes(new Date(), cached.lastUpdate) >= this.cacheTime) {
        this.forceReloadPatientList = false;
        this.getAccumulatedPage(unitId)
          .pipe(map(list => {
            const newCache = {
              list,
              lastUpdate: new Date()
            };
            this.allPatients[unitId] = newCache;
            return newCache.list;
          })).subscribe(data => sub.next(data));
      }
      else {
        sub.next(cached.list);
      }
    });
  }

  private getAccumulatedPage(unitId: number, page: number = 1, currentTotal?: number): Observable<PatientInfo[]> {
    return this.getAllPatientByUnit(unitId, page)
      .pipe(mergeMap(list => {
        const allCount = (currentTotal ?? 0) + list.data.length;
        console.log('allCount:', allCount);
        if (allCount >= list.total) {
          return of(list.data);
        }
        else {
          page++;
          return this.getAccumulatedPage(unitId, page, allCount)
            .pipe(map(additionalList => {
              return list.data.concat(additionalList);
            }));
        }
      }));
  }

  // =============== utils ============================

  getFilter(where: string): (p: PatientInfo) => boolean {
    if (!where) {
      return;
    }
    const tokens = this.tokenize(where);
    const stack = [];
    const result = this.parseRecursive(tokens, stack);

    if (stack.length === 0) { return this.parseDefault(where); }
    if (stack.length !== 1) { return null; } // expression error case

    return result;
  }

  private filterCoverage(whereString: string, base?: (x: PatientInfo) => boolean) {
    let coverage = CoverageSchemeType[whereString.replace(' ', '')] as CoverageSchemeType;
    if (!coverage) {
      switch (whereString.toLowerCase()) {
        case 'national':
        case 'nation':
          coverage = CoverageSchemeType.NationalHealthSecurity;
          break;
        case 'social':
          coverage = CoverageSchemeType.SocialSecurity;
          break;
        case 'gov':
        case 'govern':
          coverage = CoverageSchemeType.Government;
          break;
        case 'other':
          coverage = CoverageSchemeType.Other;
          break;
        case 'cash':
          coverage = CoverageSchemeType.Cash;
          break;
        default:
          break;
      }
    }
    if (base) {
      return (x: PatientInfo) => base(x) || x.coverageScheme === coverage;
    }
    return (p: PatientInfo) => p.coverageScheme === coverage;
  }

  private parseDefault(whereString: string) {
    whereString = whereString.toLowerCase();

    const cnd = (p: PatientInfo) => p.id.toLowerCase().startsWith(whereString) ||
        p.hospitalNumber.toLowerCase().startsWith(whereString) || p.name.toLowerCase().includes(whereString);

    return this.filterCoverage(whereString, cnd);
  }

  private parseConditionBlock(whereString: string) {
    const ops = [ '>', '<', '='];
    const tokens = this.tokenize(whereString, ops);
    if (tokens.length != 3) { return null; } // invalid syntax (expression error)
    const key = tokens[0];
    const op = tokens[1];
    const value = tokens[2];

    let cnd: (p: PatientInfo) => boolean;

    switch (key) {
      case 'name':
        if (op !== '=') { return null; }
        cnd = (p) => p.name.toLowerCase().startsWith(value) || p.name.toLowerCase().includes(value);
        break;
      case 'id':
        if (op !== '=') { return null; }
        cnd = (p) => p.id.toLowerCase().startsWith(value);
        break;
      case 'hn':
        if (op !== '=') { return null; }
        cnd = (p) => p.hospitalNumber.toLowerCase().startsWith(value);
        break;
      case 'sex':
      case 'gender':
        if (op !== '=') { return null; }
        const male = value[0] === 'm';
        const female = value[0] === 'f';
        const unknown = value[0] === 'u';
        cnd = (p) => (p.gender.toLowerCase()[0] === 'm') === male && !female && !unknown ||
                    (p.gender.toLowerCase()[0] === 'f') === female && !male && !unknown ||
                    !p.gender && unknown;
        break;
      case 'age':
        const age = parseInt(value, 10);
        if (isNaN(age)) { return null; }
        if (op === '=') {
          cnd = (p) => differenceInYears(new Date(), new Date(p.birthDate)) === age;
          break;
        }
        if (op === '>') {
          cnd = (p) => differenceInYears(new Date(), new Date(p.birthDate)) > age;
          break;
        }
        if (op === '<') {
          cnd = (p) => differenceInYears(new Date(), new Date(p.birthDate)) < age;
        }
        break;
      case 'coverage':
        cnd = this.filterCoverage(value);
        break;
      default:
        break;
    }

    // if (!cnd) {
    //   return null;
    // }

    return cnd;
  }

  private parseRecursive(conditionTokens: string[], stack: any[], pre: any[] = null) {
    if (!stack) {
      stack = [];
    }
    // handle parenthesis and recursive
    const tokenStack = [];
    const tmpPre = [];
    for (const token of conditionTokens) {
      if (token === ')') {
        const tmpStack = [];
        let sub = [] as string[];
        let pop: string;
        do {
          pop = tokenStack.pop();
          if (pop !== '(') {
            sub.push(pop);
          }
        } while (pop && pop !== '(');
        const prev = sub.length % 2 === 0 ? tmpPre : null; // important! determine whether this is recursive from prev level or not
        let subResult = this.parseRecursive(sub, tmpStack, prev);
        if (!subResult) { // cut-circuit
          return null;
        }
        // clear stack to fix the order
        sub = [];
        do {
          pop = tokenStack.pop();
          if (pop !== '(') {
            sub.push(pop);
          }
        } while (pop && pop !== '(');
        // push all remaining and parse right away to preserve ordering
        subResult = this.parseRecursive(sub, tmpStack, tmpPre);
        if (!subResult) { // cut-circuit
          return null;
        }
        tmpPre.push(tmpStack.pop());
      }
      else {
        tokenStack.push(token);
      }
    }

    const count = tokenStack.length;

    const opStack = [] as string[];
    while (tokenStack.length > 0) {
      const token = tokenStack.pop();
      if (token === 'and' || token === '&' || token === '&&') {
        opStack.push('&');
        continue;
      }
      if (token === 'or' || token === '|' || token === '||') {
        opStack.push('|');
        continue;
      }
      stack.push(this.parseConditionBlock(token)); // Each block parsing is in this line
    }
    while (tmpPre?.length > 0) {
      stack.push(tmpPre.pop());
    }
    while (pre?.length > 0) {
      stack.push(pre.pop());
    }

    // cut for default case to handle
    if (count === 1 && stack.length > 0 && !stack[stack.length - 1]) {
      return stack.pop();
    }

    if (opStack.length >= stack.length) { // expression error case
      return null;
    }

    while (opStack.length > 0) {
      const op = opStack.pop();
      const first = stack.pop();
      if (!first) { return null; }
      const second = stack.pop();
      if (!second) { return null; }
      if (op === '&') { stack.push(x => first(x) && second(x)); }
      else if (op === '|') { stack.push(x => first(x) || second(x)); }
      else { throw new Error('wrong operation!: ' + op); }
    }

    return stack[stack.length - 1];
  }

  // tslint:disable-next-line: member-ordering
  private readonly operators = [ ' and ', ' or ', '&', '&&', '|', '||', '(', ')' ];
  // tslint:disable-next-line: member-ordering
  private readonly syntax = [ '|', '(', ')', '^' ];
  private tokenize(where: string, operators?: string[]) {
    where = where.toLowerCase();
    const normalize = (x: string) => {
      let result = '';
      for (let index = 0; index < x.length; index++) {
        const char = x.charAt(index);
        result += this.syntax.includes(char) ? '\\' + char : char;
      }
      return result;
    };
    operators = operators ?? this.operators;
    const opString = operators.map(normalize).join('|');
    const operatorRegex = new RegExp('(' + opString + ')', 'gi');

    const tokens = where.split(operatorRegex);
    const normalized = [] as string[];
    let buffer = [] as string[];
    const canCombine = (c: string) => {
      for (const op of operators) {
        const check = op.trim();
        if (check.length <= buffer.length) { continue; } // skip
        let startWith = true;
        if (buffer.join('') !== check.slice(0, buffer.length)) {
          startWith = false;
        }
        if (startWith && check.slice(buffer.length, buffer.length + c.length) === c) { return true; }
      }

      return false;
    };
    for (const item of tokens) {
      if (!item.trim()) {
        continue;
      }
      if (operators.includes(item)) {
        if (buffer.length > 0) {
          if (!canCombine(item)) {
            normalized.push(buffer.join('').trim());
            buffer = [];
          }
        }
      }
      else if (buffer.length > 0 && operators.includes(buffer.join(''))) {
        normalized.push(buffer.join('').trim());
        buffer = [];
      }

      buffer.push(item);
    }
    if (buffer.length > 0) {
      normalized.push(buffer.join('').trim());
    }

    return normalized;
  }

}

export const PatientResolver: ResolveFn<Patient> =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const patientService = inject(PatientService);
    const fromTmp = patientService.getTmp();
    if (fromTmp) {
      return fromTmp;
    }
    
    let id = route.paramMap.get('patientId') ?? route.paramMap.get('id');
    console.log('patient ID: ', id);
    
    return patientService.getPatient(id);
  };