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
    
    this.accountService.verifyEmail(token)
        .subscribe({
            next: () => {
                // Update the status on success
                this.status = 'Thank you! Your account has been activated.';
            },
            error: (err) => {
                console.log("Full error object:", err); // ADD THIS
                // Update the status on error
                this.status = 'Verification failed. The link might be expired or already used.';
            }
        });
      }
    
}

