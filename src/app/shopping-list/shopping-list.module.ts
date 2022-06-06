import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ShoppingEditComponent } from './shopping-edit/shopping-edit.component';
import { ShoppingListComponent } from './shopping-list.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [ShoppingListComponent, ShoppingEditComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '', // changed for lazy loading
        component: ShoppingListComponent,
        children: [
          // {path: ':id/edit', component: ShoppingEditComponent}
        ],
      },
    ]),
    FormsModule,
    SharedModule,
  ],
})
export class ShoppingListModule {}
