import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private subject = new Subject<any>();

  sendMessage(message: string): void {
    this.subject.next({msg: message});
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
