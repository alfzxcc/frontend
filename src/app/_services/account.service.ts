import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Account } from '@app/_models';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
    private refreshTokenTimeout?: any;
    private accountSubject: BehaviorSubject<Account | null>;
    public account: Observable<Account | null>;

    constructor(private router: Router, private http: HttpClient) {
    // This is crucial: populate the value from local storage
    this.accountSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('user') || 'null'));
    this.account = this.accountSubject.asObservable();
    }

    public get accountValue() { return this.accountSubject.value; }

    private get httpOptions() { return { withCredentials: true }; }

    login(email: string, password: string) {
        return this.http.post<any>(`${baseUrl}/authenticate`, { email, password }, this.httpOptions)
            .pipe(map(account => {
                localStorage.setItem('user', JSON.stringify(account));
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    logout() {
        this.http.post<any>(`${baseUrl}/revoke-token`, {}, this.httpOptions).subscribe();
        this.stopRefreshTokenTimer();
        localStorage.removeItem('user');
        this.accountSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    refreshToken() {
        return this.http.post<any>(`${baseUrl}/refresh-token`, {}, this.httpOptions)
            .pipe(map((account) => {
                localStorage.setItem('user', JSON.stringify(account));
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    register(account: Account) { return this.http.post(`${baseUrl}/register`, account, this.httpOptions); }
    verifyEmail(token: string) { return this.http.post(`${baseUrl}/verify-email`, { token }, this.httpOptions); }
    forgotPassword(email: string) { return this.http.post(`${baseUrl}/forgot-password`, { email }, this.httpOptions); }
    validateResetToken(token: string) { return this.http.post(`${baseUrl}/validate-reset-token`, { token }, this.httpOptions); }
    resetPassword(token: string, password: string, confirmPassword: string) { return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword }, this.httpOptions); }
    getAll() { return this.http.get<Account[]>(baseUrl, this.httpOptions); }
    getById(id: string) { return this.http.get<Account>(`${baseUrl}/${id}`, this.httpOptions); }
    create(params: any) { return this.http.post(baseUrl, params, this.httpOptions); }
    update(id: string, params: any) { return this.http.put(`${baseUrl}/${id}`, params, this.httpOptions).pipe(map((x: any) => { if (id === this.accountValue?.id) this.accountSubject.next({ ...this.accountValue, ...x }); return x; })); }
    delete(id: string) { return this.http.delete(`${baseUrl}/${id}`, this.httpOptions).pipe(finalize(() => { if (id === this.accountValue?.id) this.logout(); })); }

    private startRefreshTokenTimer() {
        if (!this.accountValue?.jwtToken) return;
        const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));
        const expires = new Date(jwtToken.exp * 1000);
        this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), expires.getTime() - Date.now() - (60 * 1000));
    }

    private stopRefreshTokenTimer() { clearTimeout(this.refreshTokenTimeout); }
}