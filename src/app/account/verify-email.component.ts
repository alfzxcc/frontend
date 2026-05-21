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
        
        if (token) {
            this.accountService.verifyEmail(token)
                .subscribe({
                    next: () => this.status = 'Verification successful!',
                    error: () => this.status = 'Verification failed.'
                });
        } else {
            this.status = 'Invalid verification link.';
        }
    }
}

