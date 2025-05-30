import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQuizModalComponent } from './add-quiz-modal.component';

describe('AddQuizModalComponent', () => {
  let component: AddQuizModalComponent;
  let fixture: ComponentFixture<AddQuizModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddQuizModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddQuizModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
