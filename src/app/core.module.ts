import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AuthInterceptorService } from './auth/auth-intercepter.service';
import { AuthGuard } from './auth/auth.guard';
import { RecipeService } from './recipes/recipe.service';
import { ShoppingListService } from './shopping-list/shoping-list.service';

@NgModule({
  providers: [
    ShoppingListService,
    RecipeService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
    AuthGuard,
  ],
})
export class CoreModule {}
