import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { IonSearchbar, PopoverController } from '@ionic/angular';
import { Data } from 'src/app/masterdata/data';

@Component({
  selector: 'app-suggestion-popover',
  templateUrl: './suggestion-popover.component.html',
  styleUrls: ['./suggestion-popover.component.scss'],
})
export class SuggestionPopoverComponent implements OnInit, AfterViewInit {
  list: Data[] = [];
  @Output() listChange: EventEmitter<Data[]> = new EventEmitter<Data[]>();
  @Input() isPanel: boolean;
  @Output() searchEvent = new EventEmitter<string>();

  @Input() value: string;
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild("filter") searchbar: IonSearchbar;

  constructor(private ctl: PopoverController, private renderer: Renderer2, private el: ElementRef) { }

  ngAfterViewInit(): void {
    if (this.searchbar) {
      setTimeout(() => {
        this.searchbar.setFocus();
      }, 150);
    }
  }

  ngOnInit() {
    this.listChange.subscribe(data => {
      this.list = data;
    })
  }

  select(item: Data) {
    if (this.isPanel) {
      this.value = item.name;
    }
    else {
      this.ctl.dismiss(item, 'OK');
    }
  }

  ok(value: string) {
    this.ctl.dismiss(value, 'OK');
  }

  search(e) {
    this.searchEvent.emit(e.detail.value);
  }

}
