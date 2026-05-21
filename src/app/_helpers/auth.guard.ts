import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccountService } from '@app/_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private accountService: AccountService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // 1. Allow unauthenticated access to the verify-email route
    if (state.url.includes('verify-email')) {
      return true;
    }

    const account = this.accountService.accountValue;
    console.log("AuthGuard: Current account value:", account);
    if (account) {
      // 2. Check for role authorization
      if (route.data['roles'] && !route.data['roles'].includes(account.role)) {
        this.router.navigate(['/']);
        return false;
      }
      return true;
    }

    // 3. Not logged in, redirect to login page
    this.router.navigate(['/account/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}