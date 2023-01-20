import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderCasoComponent } from './loader-caso.component';

describe('LoaderCasoComponent', () => {
  let component: LoaderCasoComponent;
  let fixture: ComponentFixture<LoaderCasoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoaderCasoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoaderCasoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
