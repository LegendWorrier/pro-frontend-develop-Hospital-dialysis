import { Component, Input, OnInit } from '@angular/core';
import { StockItemInfo } from '../../stock-item';
import { LoadingController, PopoverController } from '@ionic/angular';
import { StockService } from '../../stock.service';
import { Observable, finalize } from 'rxjs';

@Component({
  selector: 'app-adjust-info',
  templateUrl: './adjust-info.component.html',
  styleUrls: ['./adjust-info.component.scss'],
})
export class AdjustInfoComponent  implements OnInit {

  @Input() stockItem: StockItemInfo;

  constructor(private popCtl: PopoverController, private stockService: StockService, private loadCtl: LoadingController) { }

  ngOnInit() {}

  close() {
    this.popCtl.dismiss();
  }

  async cancelEntry() {
    const loading = await this.loadCtl.create();
    loading.present();
    this.stockService.deleteStock(this.stockItem).pipe(finalize(() => { loading.dismiss(); })).subscribe({
      next: () => {
        this.popCtl.dismiss(true, 'OK');
      }
    });
  }

}
