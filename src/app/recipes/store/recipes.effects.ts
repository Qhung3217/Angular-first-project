import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { switchMap, map, withLatestFrom } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as RecipesActions from './recipes.actions';
import { HttpClient } from '@angular/common/http';
import { Recipe } from '../recipe.model';
import * as fromApp from '../../store/app.reducer';

@Injectable()
export class RecipesEffects {
  private url: string =
    'https://ng-course-project-start-default-rtdb.firebaseio.com/';

  fetchRecipes = createEffect(() =>
    this.actions$.pipe(
      ofType(RecipesActions.FETCH_RECIPES),
      switchMap(() => {
        return this.http.get<Recipe[]>(this.url + '/recipes.json');
      }),
      map((recipes) => {
        console.log(recipes);
        return recipes.map((recipe) => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : [],
          };
        });
      }),
      map((recipes) => new RecipesActions.SetRecipes(recipes))
    )
  );

  storeRecipese = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RecipesActions.STORE_RECIPES),
        withLatestFrom(this.store.select('recipes')), //merge value of previous observable and this observable
        switchMap(([actionData, recipesState]) =>
          this.http.put(this.url + '/recipes.json', recipesState.recipes)
        )
      ),
    { dispatch: false }
  );
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<fromApp.AppState>
  ) {}
}
