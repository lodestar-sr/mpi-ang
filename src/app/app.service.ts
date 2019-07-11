import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private subject = new Subject<any>();

  sendMessage(data: any): void {
    this.subject.next(data);
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
