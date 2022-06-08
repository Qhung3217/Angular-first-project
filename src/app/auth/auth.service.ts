import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  // user = new BehaviorSubject<User>(null);
  /*similar Subject. The difference is that behavior subject also gives subscribers immediate access to the previously emitted value even if they haven't subscribed at the point of time that value was emitted.null is inital value*/
  private tokenExpirationTimer;

  constructor(private store: Store<fromApp.AppState>) {}
  setLogoutTimer(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.store.dispatch(new AuthActions.Logout());
      console.log('timmer', expirationDuration);
    }, expirationDuration);
  }
  clearLogoutTimer() {
    if (this.tokenExpirationTimer) clearTimeout(this.tokenExpirationTimer);
    this.tokenExpirationTimer = null;
    console.log('clear timmer');
  }
}
