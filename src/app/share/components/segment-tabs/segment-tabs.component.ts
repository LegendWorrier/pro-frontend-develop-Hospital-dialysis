import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { IonContent, Platform } from '@ionic/angular';

@Component({
  selector: 'app-segment-tabs',
  templateUrl: './segment-tabs.component.html',
  styleUrls: ['./segment-tabs.component.scss'],
})
export class SegmentTabsComponent implements OnInit {

  @Input() tabs: {
    name: string,
    display: string,
    shortDisplay?: string,
    icon: string
  }[];
  @Input() initTab: string;

  @Input() value: string;
  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

  @Input() disableTab: (s: string) => boolean;

  /**
   * Whether this segment tabs is inside header or not. (If it's not under ion-content, then it's considered inside header)
   */
  @Input() inHeader: boolean;
  @Input() autoFixed: boolean = true;

  constructor(private plt: Platform, private renderer: Renderer2, private el: ElementRef) {
  }

  get width() {
    return this.plt.width();
  }

  ngOnInit() {
    if (this.autoFixed) {
      this.renderer.setAttribute(this.el.nativeElement, 'slot', 'fixed');
      this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    }

    if (this.initTab) {
      this.value = this.initTab;
    }
    else if (this.tabs.length > 0) {
      this.value = this.tabs[0].name;
    }

    if (!this.inHeader && this.autoFixed) {
      let contentEl = this.el.nativeElement.parentElement;
      while (contentEl && contentEl.localName !== "ion-content") {
        contentEl = contentEl.parentElement;
      }
      if (!contentEl) {
        throw "Cannot find IonContent element (make sure segment tabs is inside content, or mark property 'inHeader' to 'true')"
      }

      this.renderer.addClass(contentEl, 'segment-content');
    }
  }

  ontouchend(e) {
    const event = new Event('touchend', { bubbles: true, cancelable: false });
    this.el.nativeElement.parentElement.dispatchEvent(event);
  }

  onChange() {
    this.valueChange.emit(this.value);
  }

  isDisabled(t: string) {
    if (this.disableTab) {
      return this.disableTab(t);
    }
    return false;
  }

}
