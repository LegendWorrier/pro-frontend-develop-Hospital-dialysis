import { AfterViewInit, Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { IonList, Platform } from '@ionic/angular';
import { isDesktopOrLaptop as isDesktopOrLaptop } from 'src/app/utils';

@Component({
  selector: 'app-option-list',
  templateUrl: './option-list.component.html',
  styleUrls: ['./option-list.component.scss']
})
export class OptionListComponent<T> implements OnInit, AfterViewInit {

  get width() { return this.plt.width(); }

  constructor(private plt: Platform) {
  }
  @Input() data: T[];
  @Input() options: {
    name?: string,
    icon?: string,
    color: string,
    role?: string
  }[];
  @Input() canEdit: boolean;
  @Input() itemClasses: (item: T, i: number) => string[];

  @Output() selectCallback = new EventEmitter;
  @Output() optionSelectCallback = new EventEmitter;

  @ViewChild(IonList) list: IonList;
  @ContentChild('listContent') listContent;

  isDesktop: boolean = isDesktopOrLaptop(this.plt);
  get isHybrid(): boolean { return this.isDesktop && this.plt.is('tablet'); }
  getClasses: (item: T, i: number) => string[];

  static ResetOptionsVisible(data: any[]) {
    data.forEach(x =>  {
      (x as any).showBtn = false;
    });
  }

  ngOnInit(): void {
    if (!this.itemClasses) {
      this.itemClasses = () => [];
    }
    this.getClasses = this.itemClasses;
  }

  ngAfterViewInit(): void {
    this.plt.resize.subscribe(() => this.toggleSlideOption());
    this.toggleSlideOption();
  }

  toggleSlideOption() {
    if (this.isDesktop && this.plt.width() > 767) {
      this.list.closeSlidingItems();
    }
  }

  onSelect(item: T, index: number, list: T[]) {
    this.selectCallback.emit([item, index, list]);
  }

  onOptionSelect(item: T, i: number) {
    this.optionSelectCallback.emit([item, i]);
    this.list.closeSlidingItems();
  }

  toggleButtons(sliding: any, show: boolean) {
    sliding.showBtn = show;
  }

  show(sliding: any) {
    return sliding.showBtn;
  }

}
