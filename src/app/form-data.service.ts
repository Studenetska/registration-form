import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';

@Injectable({
  providedIn: 'root',
})
export class FormDataService implements InMemoryDbService {
  constructor() {}

  createDb() {
    const emails = [{ email: 'test2@test.test' }];
    return { emails };
  }
}
