import { map, switchMap, Subscription } from 'rxjs';
import { Recipe } from './../recipe.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../store/recipes.actions';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css'],
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  id: number;
  recipe: Recipe;
  editMode: boolean = false;
  recipeForm: FormGroup;
  patternAmount = /^[1-9]+[0-9]*$/;
  storeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit(): void {
    this.storeSub = this.route.params
      .pipe(
        map((params: Params) => params['id']),
        switchMap((id) => {
          this.id = +id;
          this.editMode = id != null;
          return this.store.select('recipes');
        }),
        map((recipesState) => recipesState.recipes[this.id])
      )
      .subscribe((recipe) => {
        this.recipe = recipe;
        this.initForm();
      });
  }
  ngOnDestroy(): void {
    if (this.storeSub) this.storeSub.unsubscribe();
  }

  private initForm() {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    let recipeIngredients = new FormArray([]);
    console.log('edit mode: ', this.editMode, this.id);

    if (this.editMode) {
      recipeName = this.recipe.name;
      recipeImagePath = this.recipe.imagePath;
      recipeDescription = this.recipe.description;
      if (this.recipe.ingredients) {
        for (let ingredient of this.recipe.ingredients) {
          recipeIngredients.push(
            new FormGroup({
              name: new FormControl(ingredient.name, Validators.required),
              amount: new FormControl(ingredient.amount, [
                Validators.required,
                Validators.pattern(this.patternAmount),
              ]),
            })
          );
        }
      }
    }

    this.recipeForm = new FormGroup({
      name: new FormControl(recipeName, Validators.required),
      imagePath: new FormControl(recipeImagePath, Validators.required),
      description: new FormControl(recipeDescription, Validators.required),
      ingredients: recipeIngredients,
    });
  }

  onSubmit() {
    if (this.editMode) {
      this.store.dispatch(
        new RecipesActions.UpdateRecipe({
          index: this.id,
          newRecipe: this.recipeForm.value,
        })
      );
    } else {
      this.store.dispatch(new RecipesActions.AddRecipe(this.recipeForm.value));
    }
    this.onNavigate();
    // this.recipeForm.reset();
  }

  onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        name: new FormControl(null, Validators.required),
        amount: new FormControl(null, [
          Validators.required,
          Validators.pattern(this.patternAmount),
        ]),
      })
    );
  }

  onNavigate() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
  onDeletingIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }
  getControls(name: string) {
    return (<FormArray>this.recipeForm.get(name)).controls;
  }
}
