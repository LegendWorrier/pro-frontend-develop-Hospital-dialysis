import { ApplicationRef, ComponentRef, Directive, ElementRef, EmbeddedViewRef, EnvironmentInjector, HostListener, Input, OnInit, Renderer2, createComponent } from '@angular/core';
import { IonSearchbar, IonSelect, Platform } from '@ionic/angular';
import { Data } from 'src/app/masterdata/data';
import { FilterListDirective } from './filter-list.directive';

@Directive({
  selector: '[appSelectSearch]',
  exportAs: 'SelectSearch'
})
export class SelectSearchDirective extends FilterListDirective implements OnInit {
  @Input('appSelectSearch') masterList: Data[];

  @Input() searchText: string;

  interface: string;

  inputRef: ComponentRef<IonSearchbar>;
  selectWrapper;

  constructor(private el: ElementRef<IonSelect>, 
    private renderer: Renderer2,
    private injector: EnvironmentInjector, 
    private appRef: ApplicationRef,
    private plt: Platform) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.interface = this.el.nativeElement.interface;
  }

  workaroundDoubleClick: boolean; // Don't know why but click signal will happen twice (even user only click once)

  @HostListener('click')
  onSelectHost() {
    
    if (this.workaroundDoubleClick) {
      this.workaroundDoubleClick = false;
      return;
    }
    this.workaroundDoubleClick = true;
    let initFunc = () => {
      try {
        this.initDirective(); 
      } catch (error) {
        console.error('select search error', error);
        if (this.inputRef) {
          this.appRef.detachView(this.inputRef.hostView);
          this.inputRef.destroy();
        }
        setTimeout(initFunc, 60);
      }
    };
    
    setTimeout(initFunc, 60);
    
    this.updateEvent.emit();
    
  }

  @HostListener('ionInput', ['$event'])
  onChange(e) {
    // block event listener on super
  }

  initDirective() {

    let selectBody;
    let wrapperQuery: string;
    let bodyQuery: string;
    let headerQuery: string;

    this.interface = this.el.nativeElement.interface; // update interface to support dynamic screen size
    switch (this.interface) {
      case 'popover':
        wrapperQuery = 'ion-select-popover';
        bodyQuery = 'ion-list';
        headerQuery = 'ion-list-header';
        break;
      case 'action-sheet':
        wrapperQuery = '.action-sheet-container';
        bodyQuery = '.action-sheet-button';
        headerQuery = '.action-sheet-title';
        break;
      default:
        wrapperQuery = '.alert-wrapper';
        bodyQuery = '.alert-radio-group';
        headerQuery = 'ion-list-header';
        break;
    }
    // query the latest from the list to ensure the newly created, prevent getting old one
    this.selectWrapper = Array.from(document.querySelectorAll(wrapperQuery)).pop();
    selectBody = this.selectWrapper.querySelector(bodyQuery);

    const inputElement = this.createInputElement();
    if (this.interface === 'popover' || this.interface === 'action-sheet') {
      this.renderer.setStyle(inputElement, 'position', 'sticky');
      this.renderer.setStyle(inputElement, 'position', '-webkit-sticky');
      this.renderer.setStyle(inputElement, 'top', 0);
      this.renderer.setStyle(inputElement, 'z-index', '100');
      this.renderer.setStyle(inputElement, 'background-color', 'var(--ion-background-color, #fff)');
      if (this.interface === 'popover' && this.plt.is('ios')) {
        this.renderer.setStyle(inputElement, 'flex-shrink', '0');
      }
    }
    // Searchbar
    if (this.interface === 'action-sheet') {
      const targetParent = this.selectWrapper.querySelector('.action-sheet-group-cancel');
      selectBody = targetParent.querySelector(bodyQuery);
      this.renderer.insertBefore(targetParent, inputElement, selectBody);
    }
    else {
      console.log('insert searchbar');
      this.renderer.insertBefore(this.selectWrapper, inputElement, selectBody);
    }
    
    const header = this.selectWrapper.querySelector(headerQuery);
    if (header) {
      this.renderer.setStyle(header, 'position', 'sticky');
      this.renderer.setStyle(header, 'position', '-webkit-sticky');
      this.renderer.setStyle(header, 'top', 0);
      this.renderer.setStyle(header, 'z-index', '100');
      this.renderer.setStyle(header, 'background-color', 'var(--ion-background-color, #fff)');

      if (this.interface === 'popover') {
        // Move Header to top
        this.renderer.insertBefore(this.selectWrapper, header, inputElement);
        this.renderer.setStyle(inputElement, 'top', this.plt.is('ios') ? '40px' : '45px');
      }
    }

    if (this.interface === 'popover') {
      const content = this.selectWrapper.parentElement;
      setTimeout(() => {
        console.log(content);
        const wHeight = window.innerHeight;
        const offset = parseFloat(content.style.top);
        const height = content.clientHeight;

        if (height + offset >= wHeight - 10) {
          this.renderer.setStyle(content, 'bottom', this.plt.is('ios') ? '5%' : '12px');
        }

        // console.log('window H', wHeight);
        // console.log('offset top', offset);
        // console.log('height', height);
      }, 30);
    }
    
  }

  createInputElement() {
    const componentRef = createComponent(IonSearchbar, {
      environmentInjector: this.injector
    });
    const searchbar = componentRef.instance;
    searchbar.debounce = 70;
    searchbar.placeholder = this.searchText ?? 'Type to search';
    searchbar.inputmode = 'search';
    searchbar.ionInput.subscribe(() => this.updateEvent.emit(searchbar.value));
    this.renderer.listen(componentRef.location.nativeElement, 'search', () => {
      searchbar.getInputElement().then(x => x.blur());
    });
    
    this.appRef.attachView(componentRef.hostView);
    this.inputRef = componentRef;
    
    return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
  }
  

}
