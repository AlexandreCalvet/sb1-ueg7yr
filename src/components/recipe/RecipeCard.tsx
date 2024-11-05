import React, { useState } from 'react';
import { Clock, Users, Trash2, Link as LinkIcon, Pencil, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Recipe } from '../../types';

interface RecipeCardProps {
  recipe: Recipe;
  canEdit: boolean;
  onDelete: (id: string) => Promise<void>;
  onAddToMealPlan: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, canEdit, onDelete, onAddToMealPlan }: RecipeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await onDelete(recipe.id);
    } catch (error) {
      setDeleteError('Failed to delete recipe. Please check your permissions.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {deleteError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{deleteError}</p>
          </div>
        </div>
      )}

      <Link to={`/recipes/${recipe.id}`} className="block">
        {recipe.image && (
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-48 object-cover"
            />
          </div>
        )}
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <Link 
            to={`/recipes/${recipe.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
          >
            {recipe.name}
          </Link>
          <div className="flex items-center space-x-2">
            {recipe.sourceUrl && (
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700"
              >
                <LinkIcon className="h-4 w-4" />
              </a>
            )}
            {canEdit && (
              <>
                <Link
                  to={`/recipes/${recipe.id}/edit`}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          {recipe.prepTime + recipe.cookTime} mins
          <Users className="h-4 w-4 ml-4 mr-1" />
          {recipe.servings} servings
        </div>
        <div className="mt-4">
          <h4 className="font-medium text-gray-900">Ingredients:</h4>
          <ul className="mt-2 space-y-1">
            {recipe.ingredients.slice(0, 3).map((ingredient) => (
              <li key={ingredient.id} className="text-sm text-gray-600">
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </li>
            ))}
            {recipe.ingredients.length > 3 && (
              <li className="text-sm text-gray-500 italic">
                +{recipe.ingredients.length - 3} more...
              </li>
            )}
          </ul>
        </div>
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => onAddToMealPlan(recipe)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add to Meal Plan
          </button>
          <Link
            to={`/recipes/${recipe.id}`}
            className="text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}