import { Subject } from 'rxjs';
import { ShoppingListService } from './../shopping-list/shoping-list.service';
import { Injectable } from "@angular/core";
import { Ingredient } from "../shared/ingredient.model";
import { Recipe } from "./recipe.model";
@Injectable()
export class RecipeService{
  private recipes: Recipe[] = [
    new Recipe(
      'Test Recipe',
      'This is simple test',
      'https://www.simplyrecipes.com/thmb/JWjdE8YwikAae0KZuyy6ZJW7Utw=/3000x2001/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Homemade-Pizza-Dough-Lead-Shot-1c-c2b1885d27d4481c9cfe6f6286a64342.jpg',
      [
        new Ingredient('Cheese', 10),
        new Ingredient('Powerder', 100)
      ]
      ),
    new Recipe(
      'Test Recipe 2',
      'This is simple test',
      'https://image.shutterstock.com/image-vector/caprese-salad-recipe-step-by-260nw-1201271428.jpg',
      [
        new Ingredient('sald', 10),
        new Ingredient('Meat', 1)
      ]
      ),
  ]
  recipesChanged = new Subject<Recipe[]>();

  constructor(private shoppingListService: ShoppingListService){}

  getRecipes(){
    return this.recipes.slice();//return new array of recipes not the ref
  }

  getRecipe(index: number){
    return this.recipes[index];
  }

  addIngredientToShoppingList(ingredients: Ingredient[]){
    this.shoppingListService.addIngredients(ingredients)
  }

  addRecipe(recipe: Recipe){
    this.recipes.push(recipe);
    this.recipesChanged.next(this.recipes.slice());
  }

  updateRecipe(index: number, newRecipe: Recipe){
    this.recipes[index] = newRecipe;
    this.recipesChanged.next(this.recipes.slice());
  }

  deleteRecipe(index: number){
    this.recipes.splice(index, 1);
    this.recipesChanged.next(this.recipes.slice());
  }
}
