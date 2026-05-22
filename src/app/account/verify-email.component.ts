import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/_services'; // Ensure this path matches your project structure

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
    status = '';
    loading = false;

    constructor(
        private route: ActivatedRoute,
        private accountService: AccountService
    ) {}

    ngOnInit() {
        const token = this.route.snapshot.queryParams['token'];

        if (!token) {
            this.status = 'Verification link is invalid or missing a token.';
            return;
        }

        this.loading = true;
        this.status = 'Verifying your email, please wait...';

        this.accountService.verifyEmail(token)
            .subscribe({
                next: () => {
                    this.loading = false;
                    this.status = 'Your email has been verified! You can now log in.';
                },
                error: (err) => {
                    this.loading = false;
                    this.status = 'Verification failed. The link may be expired or already used.';
                    console.error('Verification error:', err);
                }
            });
    }
}
