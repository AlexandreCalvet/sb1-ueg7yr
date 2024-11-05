import React from 'react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { Recipe } from '../types';
import { RecipeCard } from './recipe/RecipeCard';
import { AlertCircle } from 'lucide-react';

export function RecipeList() {
  const recipes = useStore((state) => state.recipes) || [];
  const error = useStore((state) => state.error);
  const removeRecipe = useStore((state) => state.removeRecipe);
  const addToMealPlan = useStore((state) => state.addToMealPlan);
  const currentUser = useAuthStore((state) => state.currentUser);
  const organization = useAuthStore((state) => state.organization);

  const handleAddToMealPlan = (recipe: Recipe) => {
    addToMealPlan({
      recipeId: recipe.id,
      date: new Date().toISOString().split('T')[0],
      mealType: 'dinner',
    });
  };

  const canEditRecipe = (recipe: Recipe) => {
    if (!currentUser || !organization) return false;
    return (
      currentUser.role === 'owner' ||
      currentUser.role === 'contributor' ||
      recipe.createdBy.id === currentUser.id
    );
  };

  if (!recipes.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No recipes found. Start by adding a new recipe!</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            canEdit={canEditRecipe(recipe)}
            onDelete={removeRecipe}
            onAddToMealPlan={handleAddToMealPlan}
          />
        ))}
      </div>
    </div>
  );
}