import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockLotPage } from './stock-lot.page';

describe('StockLotPage', () => {
  let component: StockLotPage;
  let fixture: ComponentFixture<StockLotPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StockLotPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
