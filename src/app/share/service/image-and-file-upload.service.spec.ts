import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ImageAndFileUploadService } from './image-and-file-upload.service';

describe('ImageUploadService', () => {
  let service: ImageAndFileUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    service = TestBed.inject(ImageAndFileUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
