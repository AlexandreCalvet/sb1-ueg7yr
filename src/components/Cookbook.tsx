import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Trash2, Link as LinkIcon, Pencil, ChevronRight, Globe, Lock, BookmarkPlus, BookmarkMinus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { Recipe } from '../types';

export function Cookbook() {
  const { t } = useTranslation();
  const recipes = useStore((state) => state.recipes);
  const publicRecipes = useStore((state) => state.publicRecipes);
  const bookmarks = useStore((state) => state.bookmarks);
  const removeRecipe = useStore((state) => state.removeRecipe);
  const bookmarkRecipe = useStore((state) => state.bookmarkRecipe);
  const removeBookmark = useStore((state) => state.removeBookmark);
  const currentUser = useAuthStore((state) => state.currentUser);
  const organization = useAuthStore((state) => state.organization);

  const [activeTab, setActiveTab] = useState<'private' | 'public' | 'bookmarks'>('private');

  const canEditRecipe = (recipe: Recipe) => {
    if (!currentUser || !organization) return false;
    return (
      currentUser.role === 'owner' ||
      currentUser.role === 'contributor' ||
      recipe.createdBy.id === currentUser.id
    );
  };

  const isBookmarked = (recipeId: string) => {
    return bookmarks.some(bookmark => bookmark.recipeId === recipeId);
  };

  const handleBookmarkToggle = async (recipeId: string) => {
    const bookmark = bookmarks.find(b => b.recipeId === recipeId);
    if (bookmark) {
      await removeBookmark(bookmark.id);
    } else {
      await bookmarkRecipe(recipeId);
    }
  };

  const getDisplayRecipes = () => {
    switch (activeTab) {
      case 'private':
        return recipes;
      case 'public':
        return publicRecipes;
      case 'bookmarks':
        return publicRecipes.filter(recipe => 
          bookmarks.some(bookmark => bookmark.recipeId === recipe.id)
        );
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('private')}
            className={`${
              activeTab === 'private'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Lock className="h-4 w-4 mr-2" />
            Private Recipes
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`${
              activeTab === 'public'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Globe className="h-4 w-4 mr-2" />
            Public Recipes
          </button>
          {currentUser && (
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`${
                activeTab === 'bookmarks'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Bookmarked Recipes
            </button>
          )}
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getDisplayRecipes().map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
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
                  {currentUser && recipe.isPublic && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleBookmarkToggle(recipe.id);
                      }}
                      className={`${
                        isBookmarked(recipe.id)
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-400 hover:text-gray-500'
                      }`}
                    >
                      {isBookmarked(recipe.id) ? (
                        <BookmarkMinus className="h-4 w-4" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  {canEditRecipe(recipe) && (
                    <>
                      <Link
                        to={`/recipes/${recipe.id}/edit`}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeRecipe(recipe.id);
                        }}
                        className="text-red-600 hover:text-red-700"
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
                {recipe.isPublic ? (
                  <Globe className="h-4 w-4 ml-4 text-green-500" />
                ) : (
                  <Lock className="h-4 w-4 ml-4 text-gray-400" />
                )}
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
              <div className="mt-6 flex justify-end">
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
        ))}
      </div>
    </div>
  );
}