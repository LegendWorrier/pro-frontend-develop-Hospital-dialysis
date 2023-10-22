import { AfterViewChecked, Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appFitHeight]'
})
export class FitHeightDirective implements AfterViewChecked {

  @Input('appFitHeight') contents: string | ElementRef<any> | ElementRef<any>[] | HTMLCollection | NodeListOf<any>
  @Input() directChildrenOnly: boolean = true;
  @Input() includeAncestors: boolean = false;

  constructor(private elRef: ElementRef, private renderer: Renderer2) { }

  init: boolean = false;

  initialHeight;

  ngAfterViewChecked(): void {
    
    if (!this.elRef.nativeElement.offsetHeight) {
      return;
    }
    this.initialHeight = this.elRef.nativeElement.offsetHeight;

    if (!this.init) {
      // delay a bit to workaround, issue: backdrop not fit entirely (gap at the bottom)
      setTimeout(() => {
        this.init = true;
        this.ngAfterViewChecked();
      }, 300);
      return;
    }

    const parent = this.elRef.nativeElement.parentElement as HTMLElement;
    
    if (!this.contents) {
      // case default: get all direct children
      this.contents = parent.children;
    }
    else if(typeof(this.contents) === 'string') {
      // case: css query
      let query = this.contents;
      if (this.directChildrenOnly) {

        if (!parent.id) {
          // assign random Id for the parent
          parent.id = '_' + Math.random().toString(36).substr(2, 9);
        }
        
        if (parent.id) {
          query = '#' + parent.id + ' > ' + query;
        }
        // Avoid using :scope for a sage of old browser and mobile compatability
        // else {
        //   query = ':scope > ' + query;
        // }
      }
      this.contents = this.includeAncestors && !this.directChildrenOnly? document.querySelectorAll(query) : parent.querySelectorAll(query);
    }
    else if (this.contents instanceof ElementRef) {
      console.log(this.contents)
      //case: only one specific element provided, skip array iteration.
      this.renderer.setStyle(this.elRef.nativeElement, 'height', (this.contents.nativeElement as HTMLElement).offsetHeight + 'px');
      return;
    }
    

    const elList = Array.from(this.contents).filter(x => x !== this.elRef.nativeElement);

    if (elList.length === 0) {
      console.log('no elements to match in fitHeight directive.')
      return;
    }

    const maxHeight = elList.map(x => {
      const height = (x as HTMLElement).offsetHeight;
      return height;
    }).reduce((c, p) => c > p? c:p);

    if (maxHeight > this.initialHeight) {
      this.renderer.setStyle(this.elRef.nativeElement, 'height', maxHeight + 'px');
    }
    
  }

}
