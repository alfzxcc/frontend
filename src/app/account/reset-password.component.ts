import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';

enum TokenStatus {
    Validating,
    Valid,
    Invalid
}

@Component({ templateUrl: 'reset-password.component.html', standalone: false })
export class ResetPasswordComponent implements OnInit {
    TokenStatus = TokenStatus;
    tokenStatus = TokenStatus.Validating;
    token?: string;
    form!: FormGroup;
    loading = false;
    submitted = false;
    private validated = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });

        // Guard against re-running on router.navigate([]) calls
        if (this.validated) return;
        this.validated = true;

        // Read token from URL snapshot first, fall back to observable
        const snapshotToken = this.route.snapshot.queryParams['token'];
        if (snapshotToken) {
            this.validateToken(snapshotToken);
        } else {
            // Fall back to observable for hash routing edge cases
            this.route.queryParamMap.pipe(first()).subscribe(params => {
                const token = params.get('token');
                if (!token) {
                    this.tokenStatus = TokenStatus.Invalid;
                    return;
                }
                this.validateToken(token);
            });
        }
    }

    private validateToken(token: string) {
        // Store token immediately before any async calls
        this.token = token;
        this.accountService.validateResetToken(token)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.tokenStatus = TokenStatus.Valid;
                    // DO NOT navigate away - keep token in URL until form submits
                },
                error: () => {
                    this.token = undefined;
                    this.tokenStatus = TokenStatus.Invalid;
                }
            });
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();

        if (this.form.invalid || !this.token) return;

        this.loading = true;
        this.accountService.resetPassword(this.token, this.f['password'].value, this.f['confirmPassword'].value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Password reset successful, you can now login', { keepAfterRouteChange: true });
                    this.router.navigate(['../login'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}
