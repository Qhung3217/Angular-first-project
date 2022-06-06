import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthComponent } from './auth.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AuthComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: AuthComponent }]),
  ],
})
export class AuthModule {}
