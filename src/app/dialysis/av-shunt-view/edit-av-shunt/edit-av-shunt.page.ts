import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, NgForm, Validators } from '@angular/forms';
import { IonContent, Platform } from '@ionic/angular';
import { formatISO } from 'date-fns';
import { CatheterType } from 'src/app/enums/catheter-type';
import { addOrEdit } from 'src/app/utils';
import { AvShunt } from '../../av-shunt';
import { AvShuntService } from '../../av-shunt.service';

@Component({
  selector: 'app-edit-av-shunt',
  templateUrl: './edit-av-shunt.page.html',
  styleUrls: ['./edit-av-shunt.page.scss'],
})
export class EditAvShuntPage implements OnInit, AfterViewInit {

  constructor(private plt: Platform, private avService: AvShuntService, private injector: Injector, private cdr: ChangeDetectorRef) { }

  get cathType() {
    return CatheterType;
  }

  get width() {
    return this.plt.width();
  }

  get shunt(): string {
    if (!this.dataTmp.shuntSite) {
      return null;
    }
    const side = this.dataTmp.side?.toLowerCase();
    return this.sideMap[side] + '-' + this.dataTmp.shuntSite;
  }

  set shunt(value: string) {
    const split = value.split('-');
    this.dataTmp.side = this.sideMap[split[0]];
    this.dataTmp.shuntSite = split.slice(1).join('-');
  }

  @Input() patientId: string;
  @Input() avShunt: AvShunt;
  dataTmp: AvShunt;
  editMode: boolean;

  deleted: boolean;
  currentDate: string;
  maxDate: string;

  error: string;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('form') form: NgForm;

  sideMap = {
    l: 'left',
    r: 'right',
    right: 'r',
    left: 'l'
  };

  permCathParts = [
    'jugular',
    'subcravian',
    'femoral'
  ];

  private catheterTypeControl: UntypedFormControl;

  ngAfterViewInit(): void {

    this.catheterTypeControl = new UntypedFormControl(this.dataTmp.catheterType, Validators.required);
    this.catheterTypeControl.valueChanges.subscribe(x => this.dataTmp.catheterType = x);
    this.form.form.addControl('catheterType', this.catheterTypeControl);

    this.cdr.detectChanges();
  }

  ngOnInit() {
    if (!this.avShunt) {
      this.editMode = false;
      this.dataTmp = { type: 'avShunt', patientId: this.patientId, catheterType: CatheterType.AVFistula, isActive: true };
    }
    else {
      this.editMode = true;
      this.dataTmp = Object.assign({}, this.avShunt);

      if (!this.avShunt.isActive) {
        this.deleted = true;
      }
    }
    const date = new Date();
    this.currentDate = formatISO(date);
    date.setFullYear(date.getFullYear() + 5, 11, 31);
    this.maxDate = formatISO(date);
  }

  updateShuntType(value: CatheterType) {
    this.catheterTypeControl.setValue(value);

    // reset shunt on perm cath
    if (this.dataTmp.catheterType === CatheterType.PermCath && !this.permCathParts.includes(this.dataTmp.shuntSite)) {
      this.dataTmp.shuntSite = null;
    }
  }

  async save() {

    const save$ = !this.editMode ?
      this.avService.createAvShunt(this.dataTmp)
      : this.avService.editAvShunt(this.dataTmp);

    await addOrEdit(this.injector, {
      addOrEditCall: save$,
      successTxt: { name: 'AV Shunt', editMode: this.editMode},
      content: this.content,
      errorCallback: err => this.error = err,
      isModal: true,
      successCallback: data => {
        if (!this.editMode) {
          // Add new one to the list
          data.type = 'avShunt';
          this.avService.setTmp(data);
        }
        else {
          this.avService.setTmp(this.dataTmp);
        }
      },
      completeCallback: () => this.error = null
    });
  }

}
