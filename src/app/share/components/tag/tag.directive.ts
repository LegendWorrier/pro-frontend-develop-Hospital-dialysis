import { Directive, HostBinding, Input } from '@angular/core';
import { Tag } from 'src/app/patients/patient-info';

@Directive({
  selector: '[hemoTag]'
})
export class TagDirective {
  @Input('hemoTag') tag: Tag = { text: null, bold: false, italic: false, color: null };
  @Input() placeholder: boolean;

  constructor() {

  }

  @HostBinding('innerHTML')
  get text(): string { return this.tag.text ?? (this.placeholder ? 'Tag Example' : null); }

  @HostBinding('color')
  get color(): string { return this.tag.color ? this.tag.color.split(' ')[0] : 'primary'; }

  @HostBinding('outline')
  get outline(): boolean { return (this.tag.color?.split(' ')[1]) ? true : false; }

  @HostBinding('style.text-decoration')
  get textStyle1(): string { return this.setTextStyle(); }
  @HostBinding('style.-webkit-text-decoration')
  get textStyle2(): string { return this.setTextStyle(); }

  setTextStyle() { return this.tag.strikeThroughStyle ? this.tag.strikeThroughStyle : 'none'; }

  @HostBinding('style.font-weight')
  get textBold(): string { return this.tag.bold ? 'bolder' : 'normal'; }

  @HostBinding('style.font-style')
  get textItalic(): string { return this.tag.italic ? 'italic' : 'normal'; }

}
