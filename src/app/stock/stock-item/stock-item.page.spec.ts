import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockItemPage } from './stock-item.page';

describe('StockItemPage', () => {
  let component: StockItemPage;
  let fixture: ComponentFixture<StockItemPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StockItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
