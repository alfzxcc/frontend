import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/_services'; // Ensure this path matches your project structure

@Component({ 
    selector: 'app-verify-email',
    template: `<div>{{ status }}</div>`,
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
                // Update the status on error
                this.status = 'Verification failed. The link might be expired or already used.';
            }
        });
      }
    
}

