import { isHandheldPlatform } from 'src/app/utils';
import { Platform } from '@ionic/angular';
import { Component, Input, OnInit, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-control-helper',
  templateUrl: './control-helper.component.html',
  styleUrls: ['./control-helper.component.scss'],
})
export class ControlHelperComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() autoSetup: boolean = true;
  @Input() target: ElementRef;
  @Input() step: number;

  isTouchable: boolean;
  isScrollling: boolean;

  resizeSub = null;

  constructor(private plt: Platform) { }

  ngOnDestroy(): void {
    if (this.resizeSub) {
      this.resizeSub.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    if (this.autoSetup) {
      this.init();
    }
  }

  ngOnInit() {
    this.isTouchable = isHandheldPlatform(this.plt);
  }

  init(target?: ElementRef) {
    if (target) {
      this.target = target;
    }
    if (!this.resizeSub) {
      this.resizeSub = this.plt.resize.subscribe(() => this.checkScroll());
    }
    setTimeout(() => {
      this.checkScroll();
    }, 10);
  }

  private checkScroll() {
    const containerEl = this.target.nativeElement as HTMLElement;
    const maxW = containerEl.scrollWidth;
    const w = containerEl.clientWidth;
    if (maxW - w < 1) {
      this.isScrollling = false;
    }
    else {
      this.isScrollling = true;
    }
  }

  left() {
    this.moveContainer(true);
  }

  right() {
    this.moveContainer(false);
  }

  leftMost() {
    this.moveContainer(true, true);
  }

  rightMost() {
    this.moveContainer(false, true);
  }

  moveContainer(left: boolean = false, most: boolean = false) {
    const containerEl = this.target.nativeElement as HTMLElement;
    const maxW = containerEl.scrollWidth;
    const w = containerEl.clientWidth;
    const offset = containerEl.scrollLeft;
    const scrollStep = this.step ?? 100;
    if (left) {
      if (offset > 0) {
        if (most) {
          containerEl.scrollTo(0, 0);
        }
        else {
          containerEl.scrollLeft -= scrollStep;
        }
      }
    }
    else {
      if ((offset + w) < maxW - 1) {
        if (most) {
          containerEl.scrollTo(maxW, 0);
        }
        else {
          containerEl.scrollLeft += scrollStep;
        }
      }
    }
  }

}
