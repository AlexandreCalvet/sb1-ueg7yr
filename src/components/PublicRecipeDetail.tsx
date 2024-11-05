import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Users, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { useStore } from '../store/useStore';

export function PublicRecipeDetail() {
  const { id } = useParams();
  const publicRecipes = useStore((state) => state.publicRecipes);
  const recipe = publicRecipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p>Recipe not found</p>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700">
            Back to recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              to="/"
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

          <div className="mt-6">
            <Link
              to="/login"
              className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign in to add to your meal plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}