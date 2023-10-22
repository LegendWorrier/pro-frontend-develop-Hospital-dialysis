import { Directive, ElementRef, Input, OnInit, Renderer2, EventEmitter } from '@angular/core';
import { DomController, IonContent } from '@ionic/angular';

@Directive({
  selector: '[appScrollHide]'
})
export class ScrollHideDirective implements OnInit {
  @Input('appScrollHide') config: ScrollHideConfig;
  @Input('content') scrollContent: IonContent;
  @Input('autoScrollGap') auto: boolean = true;
  @Input('canScrollSelf') canScrollSelf: boolean;
  @Input('target') targetSelector: string;
  contentHeight: number;
  scrollHeight: number;
  lastScrollPosition: number;
  lastValue: number = 0;
  bottom: number;
  lastDelta: number = 0;
  isScrolling: boolean;
  releaseTouch: boolean;
  overEdge: boolean;

  startingPoint: number;
  targetPoint: number;

  basePoint: number;
  touchStartYPoint: number;
  lastTouchTimestamp: number;
  lastYPoint: number;
  touchVelo: number;

  target: any;
  isExpanded: boolean = true;
  
  static events: Map<any, {
    init: EventEmitter<any>,
    scroll: EventEmitter<any>,
    end: EventEmitter<any>
  }> = new Map<any, {
    init: EventEmitter<any>,
    scroll: EventEmitter<any>,
    end: EventEmitter<any>
  }>();

  constructor(private element: ElementRef, private renderer: Renderer2, private domCtrl: DomController) {
  }

  async ngOnInit(): Promise<void> {
    if (this.scrollContent) {
      if (!ScrollHideDirective.events.has(this.scrollContent)) {
        ScrollHideDirective.events.set(this.scrollContent, {
          init: new EventEmitter<any>(),
          scroll: new EventEmitter<any>(),
          end: new EventEmitter<any>()
        });

        const content = (this.scrollContent as any).el;
        this.renderer.listen(content, 'touchstart', () => { ScrollHideDirective.events.get(this.scrollContent).init.emit(); });
        this.renderer.listen(content, 'touchend', () => { ScrollHideDirective.events.get(this.scrollContent).end.emit(); });
        this.scrollContent.ionScroll.subscribe((ev) => ScrollHideDirective.events.get(this.scrollContent).scroll.emit(ev));
      }
      
      this.scrollContent.ionScrollEnd.subscribe((ev) => {
        this.isScrolling = false;
        this.adjustElementOnScroll(ev);
        if (this.releaseTouch) {
          this.endScrolling();
        }
        this.overEdge = false;
      });
      this.scrollContent.scrollEvents = true;

      const contentE = ScrollHideDirective.events.get(this.scrollContent);
      contentE.init.subscribe((ev) => this.initScroll(ev));
      contentE.scroll.subscribe((ev) => this.adjustElementOnScroll(ev));
      contentE.end.subscribe(() => this.endScrolling());

      if (this.canScrollSelf) {
        this.renderer.listen(this.element.nativeElement, 'touchstart', (ev) => { 
          contentE.init.emit(ev);
        });
        this.renderer.listen(this.element.nativeElement, 'touchmove', (ev) => {
          contentE.scroll.emit(ev);
        });
        this.renderer.listen(this.element.nativeElement, 'touchend', (ev) => { 
          contentE.end.emit(ev);
        });
      }
      
      if (this.targetSelector) {
        this.target = this.element.nativeElement.querySelector(this.targetSelector);
      }
      else {
        this.target = this.element.nativeElement;
      }
      this.isExpanded = true;
    }
  }

  private async initScroll(ev) {
    if (!ev) {
      const el = await this.scrollContent.getScrollElement();
      this.contentHeight = el.offsetHeight;
      this.scrollHeight = el.scrollHeight;
      this.lastScrollPosition = el.scrollTop;
    }
    else {
      const touch = ev.touches[0];
      this.touchStartYPoint = touch.clientY;
      this.lastYPoint = this.touchStartYPoint;
      this.lastTouchTimestamp = ev.timeStamp;
    }
    
    if (this.config.maxValue === undefined) {
        this.config.maxValue = this.element.nativeElement.offsetHeight;
    }

    this.startingPoint = this.config.initValue || 0;
    this.targetPoint = this.startingPoint - ((this.config.inverse? -1 : 1) * this.config.maxValue);
    this.lastValue = this.isExpanded ? this.startingPoint : this.targetPoint;
    this.basePoint = this.lastValue;
    
    this.isScrolling = true;
    this.releaseTouch = false;
    this.renderer.setStyle(this.target, 'webkitTransition', `${this.config.cssProperty} 0ms`);
  }

  private async adjustElementOnScroll(ev) {
    if (ev) {
      const el = await this.scrollContent.getScrollElement();

      let scrollTop: number = el.scrollTop > 0 ? el.scrollTop : 0;
      let scrolldiff: number = scrollTop - this.lastScrollPosition;

      let newValue;
      
      if (ev.touches && ev.touches[0]) {
        if (scrollTop === 0 || scrolldiff === 0) {
          const touchY = ev.touches[0].clientY;
          newValue = this.basePoint - (this.touchStartYPoint - touchY);
          
          this.touchVelo = Math.abs(this.lastYPoint - touchY) / ((ev.timeStamp - this.lastTouchTimestamp) * 0.01 || 0.01)
          this.lastTouchTimestamp = ev.timeStamp;
          this.lastYPoint = touchY;
          
          this.updatePos(newValue);
        }
      }
      else {
        this.lastDelta = scrolldiff != 0? scrolldiff : this.lastDelta;
        this.bottom = this.scrollHeight - this.contentHeight;

        if (this.overEdge) {
          this.lastDelta = 0;
        }
        else {
          this.overEdge = el.scrollTop < 0 || el.scrollTop > this.bottom;
        }
        
        newValue = this.lastValue - scrolldiff;
        this.lastScrollPosition = scrollTop;
  
        if (el.scrollTop >= 0 && el.scrollTop <= this.bottom) {
          this.updatePos(newValue);
        }
      }
      
    }
  }

  private updatePos(newValue: number) {
    // clamp value
    newValue = this.config.inverse?
    Math.max(this.startingPoint, Math.min(newValue, this.targetPoint))
    :Math.min(this.startingPoint, Math.max(newValue, this.targetPoint));
    
    this.renderer.setStyle(this.target, this.config.cssProperty, `${newValue}px`);
    this.lastValue = newValue;
  }

  private async endScrolling(){
    this.releaseTouch = true;

    if (this.isScrolling) {
      return;
    }

    let spd = 200;
    if (this.touchVelo !== 0) {
      spd = spd / this.touchVelo;
    }
    let delta = this.lastDelta;

    this.renderer.setStyle(this.target, 'webkitTransition', `${this.config.cssProperty} ${spd}ms`);
    
    this.domCtrl.write(async () => {
      const isExpanding = this.config.inverse? delta > 0 : delta < 0;
      const distanceRatio = (this.lastValue-this.targetPoint)/(this.startingPoint-this.targetPoint);
      // const shouldExpand = !this.isExpanded && (this.config.inverse? distanceRatio > 0.85 : distanceRatio > 0.15);
      // const shouldCollapse = this.isExpanded && (this.config.inverse? distanceRatio < 0.15 : distanceRatio < 0.85);
      if (isExpanding || (delta == 0 && (this.config.inverse? distanceRatio < 0.5 : distanceRatio > 0.5))) {
        // Expanding
        this.renderer.setStyle(this.target, this.config.cssProperty, `${this.startingPoint}px`);
        this.isExpanded = true;
      }
      else {
        // Collapsing
        this.renderer.setStyle(this.target, this.config.cssProperty, `${this.targetPoint}px`);
        this.isExpanded = false;
        const el = await this.scrollContent.getScrollElement();
        if (el.scrollTop < this.config.maxValue && this.auto) {
          await this.scrollContent.scrollToPoint(0, this.config.maxValue, 200);
        }
        else if(this.config.inverse && (el.scrollTop > this.bottom - this.config.maxValue) && this.auto ) {
          await this.scrollContent.scrollToPoint(0, this.bottom - this.config.maxValue, 200);
        }
      }
    });
    
    this.lastDelta = 0;
    this.touchVelo = 0;
  }
}

export interface ScrollHideConfig {
  /**
   * CSS Value to manipulate, in order to hide.
   *
   * @type {string}
   * @memberof ScrollHideConfig
   */
  cssProperty: string;
  /**
   * Should be equal to the height of the element to hide.
   * 
   * @type {number}
   * @memberof ScrollHideConfig
   */
  maxValue: number;
  /**
   * Initial value of the CSS value
   *
   * @type {number}
   * @memberof ScrollHideConfig
   */
  initValue?: number;
  /**
   * Make element hide from bottom instead of top.
   *
   * @type {boolean}
   * @memberof ScrollHideConfig
   */
  inverse: boolean;
}