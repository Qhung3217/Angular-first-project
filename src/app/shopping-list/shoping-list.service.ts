import { Subject } from "rxjs";
import { Ingredient } from "../shared/ingredient.model";

export class ShoppingListService {
  ingredientsChanged = new Subject<Ingredient[]>(); //Subject better than EvenEmitter in communicate across component through serivce
  private ingredients: Ingredient[] =[
    new Ingredient('Apples', 5),
    new Ingredient('Tomato', 10),
  ]
  getIngredients(){
    return this.ingredients.slice();
  }

  addIngredient(ingredient: Ingredient){
      this.ingredients.push(ingredient);
      this.ingredientsChanged.next(this.ingredients.slice());
  }

  addIngredients(ingredients: Ingredient[]){
    this.ingredients.push(...ingredients);
    this.ingredientsChanged.next(this.ingredients.slice());
  }
}
