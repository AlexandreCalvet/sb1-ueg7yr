import React from 'react';
import { Clock, Users, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link, useNavigate } from 'react-router-dom';

export function PublicRecipes() {
  const navigate = useNavigate();
  const publicRecipes = useStore((state) => state.publicRecipes);

  const handleAddToMealPlan = () => {
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Discover Delicious Recipes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publicRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            {recipe.image && (
              <Link to={`/recipes/${recipe.id}/public`}>
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              </Link>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <Link 
                  to={`/recipes/${recipe.id}/public`}
                  className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                >
                  {recipe.name}
                </Link>
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
                  onClick={handleAddToMealPlan}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Add to Meal Plan
                </button>
                <Link
                  to={`/recipes/${recipe.id}/public`}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}