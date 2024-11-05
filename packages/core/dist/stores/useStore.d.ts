import { Recipe, MealPlan, GroceryItem, Bookmark } from '../types';
interface Store {
    recipes: Recipe[];
    publicRecipes: Recipe[];
    mealPlan: MealPlan[];
    groceryList: GroceryItem[];
    bookmarks: Bookmark[];
    isLoading: boolean;
    error: string | null;
    fetchPublicRecipes: () => Promise<void>;
    addRecipe: (recipe: Omit<Recipe, 'id' | 'organizationId'>) => Promise<void>;
    updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>;
    removeRecipe: (id: string) => Promise<void>;
    addToMealPlan: (mealPlan: Omit<MealPlan, 'id' | 'organizationId'>) => Promise<void>;
    removeFromMealPlan: (id: string) => Promise<void>;
    updateGroceryList: () => Promise<void>;
    toggleGroceryItem: (id: string) => Promise<void>;
    clearGroceryList: () => Promise<void>;
    bookmarkRecipe: (recipeId: string) => Promise<void>;
    removeBookmark: (bookmarkId: string) => Promise<void>;
    initializeSubscriptions: () => void;
    cleanup: () => void;
}
export declare const useStore: import("zustand").UseBoundStore<import("zustand").StoreApi<Store>>;
export {};
