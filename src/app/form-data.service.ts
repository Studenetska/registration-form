import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FormDataService {
  private serverUrl = 'http://localhost:3000/emails'; // Замените на ваш URL сервера

  constructor(private http: HttpClient) {}

  checkEmailExists(email: string) {
    return this.http.get<boolean>(`${this.serverUrl}/check?email=${email}`);
  }

  addEmailData(data: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'applicayion/json' });
    const option = { headers };
    return this.http.post(this.serverUrl, data, option).pipe(
      map((res) => {
        return res;
      })
    );
  }
}
