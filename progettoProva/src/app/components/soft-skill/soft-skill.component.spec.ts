import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoftSkillComponent } from './soft-skill.component';

describe('SoftSkillComponent', () => {
  let component: SoftSkillComponent;
  let fixture: ComponentFixture<SoftSkillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoftSkillComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoftSkillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
