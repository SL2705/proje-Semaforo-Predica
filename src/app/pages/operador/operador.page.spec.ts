import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperadorPage } from './operador.page';

describe('OperadorPage', () => {
  let component: OperadorPage;
  let fixture: ComponentFixture<OperadorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OperadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});