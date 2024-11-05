import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, Book, Calendar, ShoppingCart, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '@menu-planner/core';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const canContribute = currentUser?.role !== 'viewer';

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/recipes" className="text-xl font-bold text-indigo-600">
                  Menu Planner
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {currentUser?.name}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-8">
          <Link
            to="/recipes"
            className={`inline-flex items-center px-4 py-2 rounded-md ${
              location.pathname === '/recipes'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Book className="h-5 w-5 mr-2" />
            Recipes
          </Link>
          {canContribute && (
            <Link
              to="/recipes/new"
              className={`inline-flex items-center px-4 py-2 rounded-md ${
                location.pathname === '/recipes/new'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Recipe
            </Link>
          )}
          <Link
            to="/meal-plan"
            className={`inline-flex items-center px-4 py-2 rounded-md ${
              location.pathname === '/meal-plan'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Meal Plan
          </Link>
          <Link
            to="/grocery-list"
            className={`inline-flex items-center px-4 py-2 rounded-md ${
              location.pathname === '/grocery-list'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Grocery List
          </Link>
          <Link
            to="/organization"
            className={`inline-flex items-center px-4 py-2 rounded-md ${
              location.pathname === '/organization'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-5 w-5 mr-2" />
            Organization
          </Link>
        </div>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}