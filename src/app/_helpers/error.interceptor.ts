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

        // Silently ignore 401s from background token calls on page load
        if (isRevokeToken || isRefreshToken) {
          return EMPTY;
        }

        // Only auto-logout on 401 if it's NOT an admin/profile API call
        // For those, just show the error without logging out
        if (err.status === 401) {
          const isApiDataCall = request.url.includes('/accounts') &&
            (request.method === 'GET' || request.method === 'PUT');

          if (isApiDataCall) {
            // Don't logout — just surface the error message
            const error = (err && err.error && err.error.message) || 'Unauthorized';
            return throwError(() => error);
          }

          // For other 401s (e.g. expired session), logout
          if (this.accountService.accountValue) {
            this.accountService.logout();
          }
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
