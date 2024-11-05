import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Users, ArrowLeft, Pencil, Trash2, Link as LinkIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';

export function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const recipe = useStore((state) => 
    state.recipes.find((r) => r.id === id)
  );
  const removeRecipe = useStore((state) => state.removeRecipe);
  const currentUser = useAuthStore((state) => state.currentUser);
  const organization = useAuthStore((state) => state.organization);

  if (!recipe) {
    return (
      <div className="text-center">
        <p>Recipe not found</p>
        <Link to="/recipes" className="text-indigo-600 hover:text-indigo-700">
          Back to recipes
        </Link>
      </div>
    );
  }

  const canEditRecipe = () => {
    if (!currentUser || !organization) return false;
    return (
      currentUser.role === 'owner' ||
      currentUser.role === 'contributor' ||
      recipe.createdBy.id === currentUser.id
    );
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      await removeRecipe(recipe.id);
      navigate('/recipes');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="relative">
        {recipe.image && (
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="absolute top-4 left-4">
          <Link
            to="/recipes"
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {recipe.prepTime + recipe.cookTime} mins
              <Users className="h-4 w-4 ml-4 mr-1" />
              {recipe.servings} servings
            </div>
          </div>
          
          {canEditRecipe() && (
            <div className="flex space-x-2">
              <Link
                to={`/recipes/${recipe.id}/edit`}
                className="p-2 text-gray-600 hover:text-gray-700 rounded-md hover:bg-gray-50"
              >
                <Pencil className="h-5 w-5" />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:text-red-700 rounded-md hover:bg-red-50"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {recipe.sourceUrl && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-700"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Original Recipe
          </a>
        )}

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900">Ingredients</h2>
          <ul className="mt-2 space-y-2">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id} className="flex items-center text-gray-700">
                <span className="w-20 font-medium">
                  {ingredient.quantity} {ingredient.unit}
                </span>
                <span>{ingredient.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900">Instructions</h2>
          <div className="mt-2 prose prose-indigo">
            {recipe.instructions.split('\n').map((paragraph, index) => (
              <p key={index} className="text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Created by {recipe.createdBy.name}
            {recipe.createdAt && (
              <> on {new Date(recipe.createdAt).toLocaleDateString()}</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}