import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { NgForm } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit, OnDestroy {
  isLogin: boolean = true;
  isLoading: boolean = false;
  error: string = null;
  storeSub: Subscription;
  constructor(private store: Store<fromApp.AppState>) {}

  ngOnInit(): void {
    this.storeSub = this.store.select('auth').subscribe((authState) => {
      this.isLoading = authState.loading;
      this.error = authState.authError;
    });
  }
  ngOnDestroy() {
    if (this.storeSub) this.storeSub.unsubscribe();
  }

  onSwitchMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(authForm: NgForm) {
    console.log(authForm.value);
    if (!authForm.valid) return;

    const email = authForm.value.email;
    const password = authForm.value.password;

    if (this.isLogin) {
      this.store.dispatch(
        new AuthActions.LoginStart({ email: email, password: password })
      );
    } else {
      this.store.dispatch(
        new AuthActions.SignupStart({ email: email, password: password })
      );
    }
    authForm.reset();
  }
}
