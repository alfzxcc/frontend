import { catchError, of } from 'rxjs';
import { AccountService } from '@app/_services';

export function appInitializer(accountService: AccountService) {
  return () => {
    // Skip refreshToken on verify-email page to avoid race condition
    // where the 401 response interferes with the token query param
    if (window.location.hash.includes('verify-email')) {
      return of(null);
    }
    return accountService.refreshToken().pipe(
      catchError(() => of(null))
    );
  };
}
