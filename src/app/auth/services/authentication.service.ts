import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {environment} from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  private tokenSubject: BehaviorSubject<string>;
  public token: Observable<string>;

  constructor(private http: HttpClient) {
    this.tokenSubject = new BehaviorSubject<string>(localStorage.getItem('token'));
    this.token = this.tokenSubject.asObservable();
  }

  public get tokenValue(): string {
    return this.tokenSubject.value;
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${environment.apiHost}/login`, {email, password})
      .pipe(map(token => {
        localStorage.setItem('token', token.data);
        this.tokenSubject.next(token.data);
        return token.data;
      }));
  }

  logout() {
    // remove token from local storage to logout
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }
}
