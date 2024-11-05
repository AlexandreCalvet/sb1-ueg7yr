import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Users, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Recipe } from '../types';

export function PublicLanding() {
  const navigate = useNavigate();
  const publicRecipes = useStore((state) => state.publicRecipes);

  const handleAddToMealPlan = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-indigo-600">Menu Planner</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold tracking-tight">
              Discover Amazing Recipes
            </h2>
            <p className="mt-4 text-xl">
              Plan your meals, create shopping lists, and cook with confidence.
            </p>
            <div className="mt-8">
              <Link
                to="/signup"
                className="bg-white text-indigo-600 px-8 py-3 rounded-md font-medium hover:bg-gray-50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Public Recipes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">
          Popular Recipes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {recipe.image && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900">
                  {recipe.name}
                </h4>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {recipe.prepTime + recipe.cookTime} mins
                  <Users className="h-4 w-4 ml-4 mr-1" />
                  {recipe.servings} servings
                </div>
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900">Ingredients:</h5>
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
                    to="/signup"
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
    </div>
  );
}