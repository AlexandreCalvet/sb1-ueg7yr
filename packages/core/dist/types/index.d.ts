export type IngredientCategory = 'vegetable' | 'fruit' | 'meat' | 'dairy' | 'grain' | 'spice' | 'other';
export interface Ingredient {
    id: string;
    name: string;
    category: IngredientCategory;
    quantity: number;
    unit: string;
}
export interface Recipe {
    id: string;
    name: string;
    ingredients: Ingredient[];
    instructions: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    image?: string;
    organizationId: string;
    isPublic: boolean;
    createdBy: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}
export interface MealPlan {
    id: string;
    date: string;
    recipeId: string;
    mealType: 'breakfast' | 'lunch' | 'dinner';
    organizationId: string;
    userId: string;
}
export interface GroceryItem extends Ingredient {
    checked: boolean;
    userId: string;
    createdAt: string;
    updatedAt: string;
}
export type UserRole = 'owner' | 'contributor' | 'viewer';
export interface User {
    id: string;
    email: string;
    name: string;
    organizationId: string;
    role: UserRole;
}
export interface Organization {
    id: string;
    name: string;
    ownerId: string;
    users: User[];
}
export interface Bookmark {
    id: string;
    userId: string;
    recipeId: string;
    createdAt: string;
}
