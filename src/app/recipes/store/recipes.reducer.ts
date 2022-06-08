import { Recipe } from '../recipe.model';
import * as RecipeActions from './recipes.actions';
export interface State {
  recipes: Recipe[];
}

const initialState: State = {
  recipes: [],
};

export function recipeReducer(
  state = initialState,
  action: RecipeActions.RecipesActions
) {
  switch (action.type) {
    case RecipeActions.SET_RECIPES:
      return {
        ...state,
        recipes: [...action.payload],
      };
    case RecipeActions.ADD_RECIPE:
      return {
        ...state,
        recipes: [...state.recipes, action.payload],
      };
    case RecipeActions.UPDATE_RECIPE:
      return {
        ...state,
        recipes: state.recipes.map((recipe, index) =>
          index === action.payload.index
            ? { ...action.payload.newRecipe }
            : recipe
        ),
      };
    case RecipeActions.DELETE_RECIPE:
      return {
        ...state,
        recipes: state.recipes.filter(
          (recipe, index) => index !== action.payload
        ),
      };
    default:
      return state;
  }
}
