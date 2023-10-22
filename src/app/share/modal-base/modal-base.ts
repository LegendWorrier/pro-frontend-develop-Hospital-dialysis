import { Component, Input, OnInit, Output, EventEmitter, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ModalController, IonNav } from '@ionic/angular';

@Component({
  selector: 'app-modal-base',
  templateUrl: './modal-base.html',
  styleUrls: ['./modal-base.scss'],
})
// tslint:disable-next-line: component-class-suffix
export class ModalBase implements OnInit, AfterViewInit {
  @Input() root!: Component;
  @Input() props!: { [key: string]: any; };

  @Output() navInit: EventEmitter<IonNav> = new EventEmitter<IonNav>();

  @ViewChild(IonNav) nav!: IonNav;

  constructor(private modalCtl: ModalController, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.nav.setRoot(this.root as any, this.props);
    this.navInit.emit(this.nav);
    setTimeout(() => {
      this.cdr.markForCheck();
    }, 200);
  }

  close() {
    this.modalCtl.dismiss();
  }

}
