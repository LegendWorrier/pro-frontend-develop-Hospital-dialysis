import { newGuid } from './../../../share/guid';
import { ChangeDetectorRef, Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, IonNav, LoadingController, Platform } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { Assessment, AssessmentInfo, AssessmentOptionInfo, AssessmentGroupInfo } from 'src/app/dialysis/assessment';
import { AssessmentService } from 'src/app/dialysis/assessment.service';
import { AssessmentTypes } from 'src/app/enums/assessment-type.enum';
import { OptionTypes } from 'src/app/enums/option-types.enum';
import { addOrEdit, deepCopy, getName, presentToast, ToastType } from 'src/app/utils';

@Component({
  selector: 'app-assessment-detail',
  templateUrl: './assessment-detail.page.html',
  styleUrls: ['./assessment-detail.page.scss'],
})
export class AssessmentDetailPage implements OnInit {
  @Input() assessment: AssessmentInfo;
  @Input() lastPre: number;
  @Input() lastOther: number;
  @Input() lastPost: number;
  @Input() lastDialysis: number;

  @Input() preGroups: AssessmentGroupInfo[];
  @Input() otherGroups: AssessmentGroupInfo[];
  @Input() postGroups: AssessmentGroupInfo[];
  @Input() dialysisGroups: AssessmentGroupInfo[];
  editMode: boolean;

  yesLabel: string;
  noLabel: string;
  textLabel: string;
  numberLabel: string;

  error: string;
  @ViewChild(IonContent) content: IonContent;

  types = Object.values(AssessmentTypes).filter(x => typeof(x) === "number").map(x => { return { text: AssessmentTypes[x], value: x }});
  optionTypes = Object.values(OptionTypes).filter(x => typeof(x) === "number").map(x => { return { text: OptionTypes[x], value: x }});
  OptionTypes = OptionTypes;

  getName = getName;

  get showOption() {
    return !this.isValueType || this.assessment.multi;
  }

  get isValueType() {
    return this.assessment.optionType === OptionTypes.Text || this.assessment.optionType === OptionTypes.Number;
  }

  get width() { return this.plt.width(); }

  constructor(
    private assessmentService: AssessmentService,
    private injector: Injector,
    private loadingCtl: LoadingController,
    private alertCtl: AlertController,
    private nav: IonNav,
    private plt: Platform,
    private cdr: ChangeDetectorRef
    ) { }

  ngOnInit() {
    if (this.assessment) {
      this.editMode = true;
      const original = deepCopy(this.assessment);
      this.assessmentService.setTmp(original);
      this.initReadAssessment();
    }
    else {
      this.assessment = new Assessment;
    }

    
  }

  initReadAssessment() {
    const yesIndex = this.assessment.optionsList.findIndex(x => x.name === "yesLabel");
    if (yesIndex > -1) {
      this.yesLabel = this.assessment.optionsList[yesIndex].displayName;
      this.assessment.optionsList.splice(yesIndex, 1);
    }
    const noIndex = this.assessment.optionsList.findIndex(x => x.name === "noLabel");
    if (noIndex > -1) {
      this.noLabel = this.assessment.optionsList[noIndex].displayName;
      this.assessment.optionsList.splice(noIndex, 1);
    }

    const textIndex = this.assessment.optionsList.findIndex(x => x.name == "textLabel");
    if (textIndex > -1) {
      this.textLabel = this.assessment.optionsList[textIndex].displayName;
      this.assessment.optionsList.splice(textIndex, 1);
    }

    const numberIndex = this.assessment.optionsList.findIndex(x => x.name == "numberLabel");
    if (numberIndex > -1) {
      this.numberLabel = this.assessment.optionsList[numberIndex].displayName;
      this.assessment.optionsList.splice(numberIndex, 1);
    }
  }

  trackOption(index: number, item: AssessmentOptionInfo) {
    return item.id ?? (item as any).tmpId;
  }

  getGroup() {
    const unselect = this.assessment.groupId ? [{id: null, displayName: 'None' }] : [];
    if (this.assessment.type === AssessmentTypes.Pre) {
      return [...unselect, ...this.preGroups];
    }
    else if (this.assessment.type === AssessmentTypes.Post) {
      return [...unselect, ...this.postGroups];
    }
    else if (this.assessment.type === AssessmentTypes.Other) {
      return [...unselect, ...this.otherGroups];
    }
    else {
      return [...unselect, ...this.dialysisGroups];
    }
  }

  addNewOption() {
    const newId = newGuid();
    const newOption = {order: this.assessment.optionsList.length, name:null,displayName:null, tmpId: newId };
    this.assessment.optionsList.push(newOption);
  }

  swap(first: AssessmentOptionInfo, second: AssessmentOptionInfo) {
    if (!second || !first) {
      return;
    }

    const list = this.assessment.optionsList;
    const firstIndex = list.findIndex(x => x.id === first.id);
    const secondIndex = list.findIndex(x => x.id === second.id);
    [list[firstIndex], list[secondIndex]] = [list[secondIndex], list[firstIndex]];
  }

  save() {
    if (this.assessment.optionType === OptionTypes.Checkbox && !this.assessment.multi) {
      // make sure the option list is clean
      this.assessment.optionsList.length = 0;
      // fill in special items for label
      if (this.yesLabel) {
        this.assessment.optionsList.push(
          {
            order: 0,
            name: 'yesLabel',
            displayName: this.yesLabel
          });
      }
      if (this.noLabel) {
        this.assessment.optionsList.push(
          {
            order: 1,
            name: 'noLabel',
            displayName: this.noLabel
          });
      }
      this.assessment.hasOther = false;
    }
    else if (this.assessment.optionType === OptionTypes.Radio) {
      this.assessment.multi = false;
    }
    else if (this.isValueType) {
      this.assessment.hasNumber = false;
      this.assessment.hasText = false;
      if (!this.assessment.multi) {
        this.assessment.hasOther = false;
      }
    }

    if (this.assessment.hasText && this.textLabel) {
      this.assessment.optionsList.push({
        order: this.assessment.optionsList.length,
        name: 'textLabel',
        displayName: this.textLabel
      });
    }
    if (this.assessment.hasNumber && this.numberLabel) {
      this.assessment.optionsList.push({
        order: this.assessment.optionsList.length,
        name: 'numberLabel',
        displayName: this.numberLabel
      });
    }

    if (!this.editMode) {
      (<Assessment> this.assessment).order = 
        this.assessment.type === AssessmentTypes.Pre ? this.lastPre :
        this.assessment.type === AssessmentTypes.Other? this.lastOther :
        this.assessment.type === AssessmentTypes.Post? this.lastPost : this.lastDialysis;
    }
    if (this.assessment.optionsList.length > 1) {
      for (let i = 0; i < this.assessment.optionsList.length; i++) {
        const element = this.assessment.optionsList[i];
        element.order = i;
      }
    }

    const $call = this.editMode ?
      this.assessmentService.updateAssessment(this.assessment)
      : this.assessmentService.addAssessment(this.assessment);
    addOrEdit(this.injector, {
      addOrEditCall: $call,
      successCallback: (data: AssessmentInfo) => {
        if (this.editMode) {
          this.assessmentService.setTmp(null);
          this.assessment.updated = data.updated;
          this.assessment.updatedBy = data.updatedBy;
        }
        else {
          this.assessmentService.setTmp(data);
        }
      },
      successTxt: {
        name: 'Assessment',
        editMode: this.editMode
      },
      errorCallback: (err) => this.error = err,
      completeCallback: () => this.error = null,
      content: this.content,
      isModal: true
    });
  }

  async delete() {
    const alert = await this.alertCtl.create({
      backdropDismiss: true,
      header: 'Confirmation',
      subHeader: 'Delete Assessment',
      message: 'Are you sure you want to delete this assessment? The assessment will be permanently deleted and cannot be restored back.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          role: 'OK',
          handler: async () => {
            const loading = await this.loadingCtl.create({backdropDismiss: false});
            loading.present();
            this.assessmentService.removeAssessment(this.assessment)
              .pipe(finalize(() => loading.dismiss()))
              .subscribe({
                next: () => {
                  this.assessmentService.setTmp({id: 0});
                  presentToast(this.injector, {
                    message: 'The assessment has been permanently deleted.',
                    header: 'Deleted',
                    type: ToastType.alert
                  });
                  this.nav.pop();
                },
                error: (err) => {
                  console.log(err);
                  presentToast(this.injector, {
                    message: 'Cannot delete the assessment due to some technical issue. Please try again.',
                    header: 'Failed',
                    native: true
                  });
                }
              });
          }
        }
      ]
    });
    alert.present();
  }

}
