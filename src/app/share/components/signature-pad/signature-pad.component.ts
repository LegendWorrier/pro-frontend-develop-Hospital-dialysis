import SignaturePad, { PointGroup } from 'signature_pad';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss'],
})
export class SignaturePadComponent  implements OnInit {

  sig: SignaturePad;

  @ViewChild('sigPad') sigPad: ElementRef<HTMLCanvasElement>;

  constructor(private modal: ModalController) { }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.sig = new SignaturePad(this.sigPad.nativeElement);

    window.addEventListener("resize", () => {
      setTimeout(() => {
        const tmp = this.sig.toData();
        this.resizeCanvas(tmp);
      }, 50);
    });

    setTimeout(() => {
      this.resizeCanvas();
    }, 50);
  }

  private resizeCanvas(currentData?: PointGroup[]) {
    const canvas = this.sigPad.nativeElement;
    const ctx = canvas.getContext("2d");
    const transform = ctx.getTransform();
    const currentX = transform.a;
    const currentY = transform.d;

    const ratioX = canvas.offsetWidth / canvas.width;
    const ratioY = canvas.offsetHeight / canvas.height;
    ctx.resetTransform();
    ctx.scale(1/ratioX, 1/ratioY);
    this.sig.clear(); // otherwise isEmpty() might return incorrect value

    if (currentData) {
      const newTransform = ctx.getTransform();
      const newX = newTransform.a;
      const newY = newTransform.d;
      const difX = currentX / newX;
      const difY = currentY / newY;
      currentData.forEach(item => {
        item.points.forEach(dot => {
          dot.x = dot.x * difX;
          dot.y = dot.y * difY;
        });
      });
      this.sig.fromData(currentData);
    }
  }

  confirm() {
    this.modal.dismiss(this.sig.toDataURL(), 'ok')
  }

  cancel() {
    this.modal.dismiss();
  }

}
