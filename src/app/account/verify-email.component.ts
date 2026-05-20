import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '@app/_services/account.service'; // Double check this path matches your project structure

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  standalone: false
})
export class VerifyEmailComponent implements OnInit {
  tokenStatus: 'verifying' | 'success' | 'failed' = 'verifying';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public accountService: AccountService // Changed to public so the manual template fallback can see it
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParams['token'];

    if (!token) {
      this.tokenStatus = 'failed';
      return;
    }

    this.verify(token);
  }

  verify(token: string) {
    this.tokenStatus = 'verifying';
    this.accountService.verifyEmail(token)
      .subscribe({
        next: () => {
          this.tokenStatus = 'success';
          setTimeout(() => this.router.navigate(['/account/login']), 3000);
        },
        error: (error) => {
          console.error(error);
          this.tokenStatus = 'failed';
        }
      });
  }
}