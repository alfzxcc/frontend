import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/_services'; // Ensure this path matches your project structure

@Component({ 
    selector: 'app-verify-email',
    template: `
        <div class="text-center">
            <h3>Verify Email</h3>
            <p>{{ status }}</p>
            <a *ngIf="status !== 'Verifying...'" routerLink="/account/login" class="btn btn-primary">Go to Login</a>
        </div>
    `,
    standalone: false
})
export class VerifyEmailComponent implements OnInit {
    status = 'Verifying...';

    constructor(
        private route: ActivatedRoute,
        private accountService: AccountService
    ) {}

    ngOnInit() {
    const token = this.route.snapshot.queryParams['token'];
    
    // Explicitly check if token exists
    if (!token) return;

    this.accountService.verifyEmail(token)
        .subscribe({
            next: () => {
                // This triggers when the backend returns HTTP 200
                this.status = 'Thank you! Your account has been activated.';
            },
            error: (err) => {
                // This triggers if the backend returns HTTP 400 (already verified or invalid)
                this.status = 'Verification failed. The link might be expired or already used.';
                console.error("Verification error:", err);
            }
        });
  }
}
