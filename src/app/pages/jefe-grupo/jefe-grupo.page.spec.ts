import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JefeGrupoPage } from './jefe-grupo.page';

describe('JefeGrupoPage', () => {
  let component: JefeGrupoPage;
  let fixture: ComponentFixture<JefeGrupoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JefeGrupoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
