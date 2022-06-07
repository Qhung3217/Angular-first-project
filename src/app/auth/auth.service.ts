import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, tap, BehaviorSubject } from 'rxjs';

import { User } from './user.model';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}
interface ErrorBlock {
  errorCode: string;
  errorMessage: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // user = new BehaviorSubject<User>(null);
  /*similar Subject. The difference is that behavior subject also gives subscribers immediate access to the previously emitted value even if they haven't subscribed at the point of time that value was emitted.null is inital value*/
  private tokenExpirationTimer;

  keyQueryParam: string = '?key=AIzaSyDGVcR-_9zGBWKW6h6ae3wySRrLX4jxz5E';
  urlSignUp =
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp' +
    this.keyQueryParam;
  urlLogin =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword' +
    this.keyQueryParam;

  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) {}

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(this.urlSignUp, {
        email,
        password,
        returnSecureToken: true,
      })
      .pipe(
        catchError(this.handleCatchError),
        tap((resData) => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(this.urlLogin, {
        email,
        password,
        returnSecureToken: true,
      })
      .pipe(
        catchError(this.handleCatchError),
        tap((resData) => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationData: string;
    } = JSON.parse(localStorage.getItem('userData'));
    console.log(userData);

    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationData)
    );

    if (loadedUser.token) {
      // this.user.next(loadedUser);
      this.store.dispatch(
        new AuthActions.Login({
          email: loadedUser.email,
          userId: loadedUser.id,
          token: loadedUser.token,
          expirationDate: new Date(userData._tokenExpirationData),
        })
      );
      const expirationDuration =
        new Date(userData._tokenExpirationData).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    // this.user.next(null);
    this.store.dispatch(new AuthActions.Logout());
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) clearTimeout(this.tokenExpirationTimer);
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    // this.user.next(user);
    this.store.dispatch(
      new AuthActions.Login({
        email: user.email,
        userId: user.id,
        token: user.token,
        expirationDate: expirationDate,
      })
    );
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleCatchError(errRes: HttpErrorResponse) {
    let errorMessage: string = 'An unknow error occured!';

    if (!errRes.error && !errRes.error.error)
      return throwError(() => errorMessage);
    console.log('catch error: ', errRes);

    switch (errRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist!';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'Wrong password!';
        break;
      case 'USER_DISABLED':
        errorMessage = 'Your account is banned!';
        break;
    }

    return throwError(() => errorMessage);
  }
  /*private handleCatchError(
    errRes: HttpErrorResponse,
    errorBlocks: ErrorBlock[]
  ) {
    let errorMessage: string = 'An unknow error occured!';
    if (!errRes.error && !errRes.error.error) return errorMessage;
    const errorCodeRes = errRes.error.error.message;
    const catchErrorBlock = errorBlocks.find((errorBlock) => {
      return errorBlock.errorCode === errorCodeRes;
    });
    console.log(catchErrorBlock, errorBlocks);
    errorMessage = catchErrorBlock.errorMessage;

    return errorMessage;
  }*/

  // catchError((errRes) => {
  //   const errorBlocks: ErrorBlock[] = [
  //     {
  //       errorCode: 'EMAIL_NOT_FOUND',
  //       errorMessage: 'This email does not exist!',
  //     },
  //     { errorCode: 'INVALID_PASSWORD', errorMessage: 'Wrong password!' },
  //     {
  //       errorCode: 'USER_DISABLED',
  //       errorMessage: 'Your account is banned!',
  //     },
  //   ];
  //   return throwError(() => this.handleCatchError(errRes, errorBlocks));
  // })
}
