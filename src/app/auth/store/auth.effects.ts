import { AuthService } from './../auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as AuthActions from './auth.actions';
import { Injectable } from '@angular/core';
import { User } from '../user.model';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

@Injectable()
export class AuthEffects {
  urlSignUp =
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
    environment.firebaseAPIKey;
  urlLogin =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
    environment.firebaseAPIKey;

  authSignupStart = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.SIGNUP_START),
      switchMap((signupData: AuthActions.SignupStart) => {
        return this.http
          .post<AuthResponseData>(this.urlSignUp, {
            email: signupData.payload.email,
            password: signupData.payload.password,
            returnSecureToken: true,
          })
          .pipe(
            tap((resData) =>
              this.authService.setLogoutTimer(+resData.expiresIn * 1000)
            ),
            map((resData) =>
              this.handleAuthentication(
                resData.email,
                resData.localId,
                resData.idToken,
                +resData.expiresIn
              )
            ),
            catchError(this.handleError)
          );
      })
    )
  );
  authLoginStart = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.LOGIN_START),
      switchMap((authData: AuthActions.LoginStart) => {
        return this.http
          .post<AuthResponseData>(this.urlLogin, {
            email: authData.payload.email,
            password: authData.payload.password,
            returnSecureToken: true,
          })
          .pipe(
            tap((resData) =>
              this.authService.setLogoutTimer(+resData.expiresIn * 1000)
            ),
            map((resData) =>
              this.handleAuthentication(
                resData.email,
                resData.localId,
                resData.idToken,
                +resData.expiresIn
              )
            ),
            catchError(this.handleError)
          );
      })
    );
  });

  authRedirect = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS),
        tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
          if (authSuccessAction.payload.redirect) this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );

  autoLogin = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.AUTO_LOGIN),
      map(() => {
        const userData: {
          email: string;
          id: string;
          _token: string;
          _tokenExpirationData: string;
        } = JSON.parse(localStorage.getItem('userData'));
        console.log(userData);

        if (!userData) {
          return { type: 'DUMMY' };
        }

        const loadedUser = new User(
          userData.email,
          userData.id,
          userData._token,
          new Date(userData._tokenExpirationData)
        );

        if (loadedUser.token) {
          const expirationDuration =
            new Date(userData._tokenExpirationData).getTime() -
            new Date().getTime();
          console.log('auto login', expirationDuration * 1000);

          this.authService.setLogoutTimer(expirationDuration);
          return new AuthActions.AuthenticateSuccess({
            email: loadedUser.email,
            userId: loadedUser.id,
            token: loadedUser.token,
            expirationDate: new Date(userData._tokenExpirationData),
            redirect: false,
          });
        }

        return { type: 'DUMMY' };
      })
    )
  );

  authLogout = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.LOGOUT),
        tap(() => {
          console.log('logout');
          localStorage.removeItem('userData');
          this.router.navigate(['/auth']);
          this.authService.clearLogoutTimer();
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  private handleAuthentication = (
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) => {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    localStorage.setItem('userData', JSON.stringify(user));
    return new AuthActions.AuthenticateSuccess({
      email: email,
      userId: userId,
      token: token,
      expirationDate: expirationDate,
      redirect: true,
    });
  };

  private handleError = (errRes: any) => {
    let errorMessage: string = 'An unknow error occured!';
    console.log('errRes: ', errRes);
    if (!errRes.error || !errRes.error.error)
      return of(new AuthActions.AuthenticateFail(errorMessage));
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
    return of(new AuthActions.AuthenticateFail(errorMessage));
  };
}
