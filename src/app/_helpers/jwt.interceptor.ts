import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AccountService } from '@app/_services';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler) {
        const user = this.accountService.accountValue;
        if (user && user.jwtToken) {
            request = request.clone({
                setHeaders: { Authorization: `Bearer ${user.jwtToken}` }
            });
        }
        return next.handle(request);
    }
}