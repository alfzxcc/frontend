import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AccountService } from '@app/_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private accountService: AccountService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        const isRevokeToken = request.url.includes('revoke-token');
        const isRefreshToken = request.url.includes('refresh-token');

        // Silently ignore 401s from revoke-token and refresh-token —
        // these fire on page load when no session exists and must NOT
        // show "Unauthorized" to the user or trigger a logout
        if (isRevokeToken || isRefreshToken) {
          return EMPTY;
        }

        if ([401, 403].includes(err.status) && this.accountService.accountValue) {
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
