import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecursosHumanosPage } from './recursos-humanos.page';

describe('RecursosHumanosPage', () => {
  let component: RecursosHumanosPage;
  let fixture: ComponentFixture<RecursosHumanosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecursosHumanosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
