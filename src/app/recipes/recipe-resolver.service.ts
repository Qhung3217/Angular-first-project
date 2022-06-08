import { map, take, tap, switchMap, of } from 'rxjs';
import { ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Recipe } from './recipe.model';
import { Actions } from '@ngrx/effects';
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from './store/recipes.actions';
import { Store } from '@ngrx/store';

@Injectable({ providedIn: 'root' })
export class RecipeResolverService implements Resolve<Recipe[]> {
  constructor(
    private actions$: Actions,
    private store: Store<fromApp.AppState>
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select('recipes').pipe(
      take(1),
      map((recipesState) => recipesState.recipes),
      switchMap((recipes) => {
        if (recipes.length === 0) {
          this.store.dispatch(new RecipesActions.FetchRecipes());
          return this.actions$.pipe(
            ofType(RecipesActions.SET_RECIPES),
            take(1)
          );
        }
        return of(recipes);
      })
    );
  }
}
