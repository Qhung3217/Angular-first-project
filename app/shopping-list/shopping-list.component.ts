import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from './shoping-list.service';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css'],
  providers: []
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  ingredients: Ingredient[];
  constructor(private shoppingListService: ShoppingListService) { }

  ngOnInit(): void {
    this.ingredients = this.shoppingListService.getIngredients()
    this.subscription = this.shoppingListService
      .ingredientsChanged.subscribe( (ingredients: Ingredient[]) => {
        this.ingredients = ingredients
      })
  }

  onEditIngredient(index:number){
    this.shoppingListService.sendIndexOfIngredientEdited.next(index);
  }

  ngOnDestroy(): void {
      this.subscription.unsubscribe();
  }
}