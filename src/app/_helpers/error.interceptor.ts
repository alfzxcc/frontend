import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AccountService } from '@app/_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private accountService: AccountService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        // ✅ ignore 401 errors from revoke-token so logout doesn't clear accountValue
        const isRevokeToken = request.url.includes('revoke-token');
        if ([401, 403].includes(err.status) && this.accountService.accountValue && !isRevokeToken) {
          this.accountService.logout();
        }
        const error =
          (err && err.error && err.error.message) ||
          err.statusText ||
          'Server Error';
        console.error(err);
        return throwError(() => error);
      })
    );
  }
}