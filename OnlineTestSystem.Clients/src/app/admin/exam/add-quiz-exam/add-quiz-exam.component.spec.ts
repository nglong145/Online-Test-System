import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQuizExamComponent } from './add-quiz-exam.component';

describe('AddQuizExamComponent', () => {
  let component: AddQuizExamComponent;
  let fixture: ComponentFixture<AddQuizExamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddQuizExamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddQuizExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
