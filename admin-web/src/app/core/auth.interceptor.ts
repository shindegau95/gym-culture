import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly firebase: FirebaseService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return from(this.firebase.getIdToken()).pipe(
      switchMap((token) => {
        const authedReq = token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;
        return next.handle(authedReq);
      }),
    );
  }
}
