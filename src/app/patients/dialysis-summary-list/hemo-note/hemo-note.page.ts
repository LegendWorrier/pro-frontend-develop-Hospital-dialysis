import { DehydrationCalculate, HemoDialysisService } from 'src/app/dialysis/hemo-dialysis.service';
import { Component, Input, OnInit, Injector } from '@angular/core';
import { Platform } from '@ionic/angular';
import { HemoNote, HemosheetNoteInfo } from 'src/app/dialysis/hemosheet-note-info';
import { Patient } from '../../patient';
import { HemoSetting } from 'src/app/dialysis/hemo-setting';
import { addOrEdit } from 'src/app/utils';
import { DialysisType } from 'src/app/enums/dialysis-type';

@Component({
  selector: 'app-hemo-note',
  templateUrl: './hemo-note.page.html',
  styleUrls: ['./hemo-note.page.scss'],
})
export class HemoNotePage implements OnInit {
  @Input() hemoNote: HemosheetNoteInfo;
  @Input() patient: Patient;
  @Input() setting: HemoSetting.All;

  tmp: HemoNote = { complication: '' };

  dehydration: DehydrationCalculate;

  error: string;

  get width() { return this.plt.width(); }

  constructor(private plt: Platform, private hemo: HemoDialysisService, private injector: Injector) { }

  ngOnInit() {
    if (this.hemoNote.note) {
      this.tmp = Object.assign({}, this.hemoNote.note);
    }

    this.dehydration = new DehydrationCalculate(this.hemoNote);
    
  }

  getType(type) {
    return DialysisType[type];
  }

  async save() {
    const update$ = this.hemo.updateHemoNote(this.hemoNote.id, this.tmp);

    await addOrEdit(this.injector, {
      addOrEditCall: update$,
      successTxt: 'Updated Note successfully',
      successCallback: (data) => {
        if (data) {
          this.hemoNote.note = data;
        }
      }
    })
  }

}
