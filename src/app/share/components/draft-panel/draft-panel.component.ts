import { deepCopy, presentToast } from 'src/app/utils';
import { DraftService } from './../../service/draft.service';
import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';

@Component({
  selector: 'app-draft-panel',
  templateUrl: './draft-panel.component.html',
  styleUrls: ['./draft-panel.component.scss'],
})
export class DraftPanelComponent<T> implements OnInit {

  @Input() draft: T
  @Input() draftKey: string;

  @Input() preSave: () => void | Promise<void>;
  @Input() postLoad: (data: T) => void | Promise<void>;

  @Input() data: T;
  @Output() dataChange = new EventEmitter<T>();

  @Input() isLoaded: boolean = false;
  @Input() canEdit: boolean = true;

  constructor(private draftService: DraftService, private injector: Injector) { }

  async ngOnInit() {
    console.log('draft key:', this.draftKey);
    if (!this.draft) {
      this.draft = await this.draftService.getDraft(this.draftKey);
      console.log('draft', this.draft);
    }
  }

  async save() {
    if (this.preSave) {
      if (this.preSave instanceof Promise) {
        await this.preSave();
      }
      else {
        this.preSave();
      }
    }
    
    this.draft = deepCopy(this.data);
    this.isLoaded = true;
    console.log('draft', this.draft);
    await this.draftService.saveDraft(this.draftKey, this.draft);

    presentToast(this.injector, {
      header: 'Saved!',
      message: 'The data has been saved as draft data.',
      native: true
    });
  }

  async load() {
    this.data = deepCopy(this.draft);
    this.dataChange.emit(this.data);
    this.isLoaded = true;

    if (this.postLoad) {
      if (this.postLoad instanceof Promise) {
        await this.postLoad(this.data);
      }
      else {
        this.postLoad(this.data);
      }
    }

    presentToast(this.injector, {
      header: 'Loaded',
      message: 'Data loaded.',
      native: true
    });
  }

  clear() {
    this.draftService.removeDraft(this.draftKey);
    this.draft = null;
    presentToast(this.injector, {
      header: 'Cleared',
      message: 'The data has been cleared.',
      native: true
    });
  }

}
