import { TestBed } from '@angular/core/testing';

import { ExamExtendService } from './exam-extend.service';

describe('ExamExtendService', () => {
  let service: ExamExtendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamExtendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
