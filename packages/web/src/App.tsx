import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useStore } from '@menu-planner/core';
import { useInitializeApp } from './hooks/useInitializeApp';
import { RecipeForm } from './components/RecipeForm';
import { RecipeList } from './components/RecipeList';
import { RecipeDetail } from './components/RecipeDetail';
import { MealPlanner } from './components/MealPlanner';
import { GroceryList } from './components/GroceryList';
import { SignInForm } from './components/auth/SignInForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { OrganizationManagement } from './components/organization/OrganizationManagement';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/PublicLayout';
import { PublicRecipes } from './components/PublicRecipes';
import { PublicRecipeDetail } from './components/PublicRecipeDetail';

function App() {
  useInitializeApp();
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);
  const fetchPublicRecipes = useStore((state) => state.fetchPublicRecipes);

  // Fetch public recipes when the app loads
  useEffect(() => {
    fetchPublicRecipes();
  }, [fetchPublicRecipes]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicRecipes />} />
        <Route path="/recipes/:id/public" element={<PublicRecipeDetail />} />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/recipes" /> : <SignInForm />
        } />
        <Route path="/signup" element={
          isAuthenticated ? <Navigate to="/recipes" /> : <SignUpForm />
        } />
      </Route>

      {/* Protected routes */}
      {isAuthenticated ? (
        <Route element={<Layout />}>
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/recipes/new" element={<RecipeForm />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/recipes/:id/edit" element={<RecipeForm />} />
          <Route path="/meal-plan" element={<MealPlanner />} />
          <Route path="/grocery-list" element={<GroceryList />} />
          <Route path="/organization" element={<OrganizationManagement />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
}

export default App;