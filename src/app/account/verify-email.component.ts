import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/_services';
import { first } from 'rxjs/operators';

@Component({ 
    selector: 'app-verify-email',
    template: `
        <div class="text-center mt-5">
            <h3>Verify Email</h3>
            <div *ngIf="loading" class="spinner-border text-primary my-3"></div>
            <p>{{ status }}</p>
            <a *ngIf="!loading" routerLink="/account/login" class="btn btn-primary mt-2">Go to Login</a>
        </div>
    `,
    standalone: false
})
export class VerifyEmailComponent implements OnInit {
    status = 'Verifying your email, please wait...';
    loading = true;

    constructor(
        private route: ActivatedRoute,
        private accountService: AccountService
    ) {}

    ngOnInit() {
        // Use queryParamMap observable (not snapshot) to avoid race condition
        // with APP_INITIALIZER refreshToken() call on first page load
        this.route.queryParamMap.pipe(first()).subscribe(params => {
            const token = params.get('token');

            if (!token) {
                this.loading = false;
                this.status = 'Verification link is invalid or missing a token.';
                return;
            }

            this.accountService.verifyEmail(token).subscribe({
                next: () => {
                    this.loading = false;
                    this.status = 'Your email has been verified! You can now log in.';
                },
                error: (err) => {
                    this.loading = false;
                    // Token was already cleared in DB (already verified) - show friendly message
                    if (err && (err.includes('already') || err.includes('invalid') || err.includes('Invalid'))) {
                        this.status = 'Your email is already verified. You can log in.';
                    } else {
                        this.status = 'Verification failed. The link may be expired or already used.';
                    }
                    console.error('Verification error:', err);
                }
            });
        });
    }
}
