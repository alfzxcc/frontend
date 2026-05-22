import { catchError, of } from 'rxjs';
import { AccountService } from '@app/_services';

export function appInitializer(accountService: AccountService) {
  return () => {
    const hash = window.location.hash;

    // Skip refreshToken on these pages to avoid race conditions
    // where the async 401 interferes with token query params
    const skipPages = ['verify-email', 'reset-password', 'forgot-password'];
    if (skipPages.some(page => hash.includes(page))) {
      return of(null);
    }

    return accountService.refreshToken().pipe(
      catchError(() => of(null))
    );
  };
}
