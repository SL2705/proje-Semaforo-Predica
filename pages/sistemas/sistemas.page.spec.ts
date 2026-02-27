import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SistemasPage } from './sistemas.page';

describe('SistemasPage', () => {
  let component: SistemasPage;
  let fixture: ComponentFixture<SistemasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SistemasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
