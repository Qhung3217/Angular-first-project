import { AuthService } from './../auth/auth.service';
import { RecipeService } from './../recipes/recipe.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Recipe } from '../recipes/recipe.model';
import { exhaustMap, map, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  private url: string =
    'https://ng-course-project-start-default-rtdb.firebaseio.com/';

  constructor(
    private http: HttpClient,
    private recipeService: RecipeService,
    private authService: AuthService
  ) {}

  storageRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.http
      .put(this.url + '/recipes.json', recipes)
      .subscribe((response) => console.log(response));
  }

  fetchRecipes() {
    return this.http.get<Recipe[]>(this.url + '/recipes.json').pipe(
      map((recipes) => {
        return recipes.map((recipe) => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : [],
          };
        });
      }),
      tap((recipes) => {
        return this.recipeService.setRecipes(recipes);
      })
    );
  }

  /*Another way for fetchRecipes
  fetchRecipes() {
    return this.authService.user.pipe(
      take(1), //automative subscript 1 time then unsubscribe
      exhaustMap((user) => {
        return this.http.get<Recipe[]>(this.url + '/recipes.json', {
          params: new HttpParams().set('auth', user.token),
        });
      }), // when user observable is complete which will happen after we took that latest user. Thereafter, it give us that user so we can pass in a function. There we get the data from the previous observable and now we return a new observable in there which will replace the user obserevable and wait for subscribe
      map((recipes) => {
        return recipes.map((recipe) => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : [],
          };
        });
      }),
      tap((recipes) => {
        return this.recipeService.setRecipes(recipes);
      })
    );
  }*/
}
