import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusCircle, MinusCircle, Upload, X, Globe, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { Ingredient, IngredientCategory, Recipe } from '../types';

const categories: IngredientCategory[] = [
  'produce',
  'meat',
  'seafood',
  'deli',
  'dairy',
  'sweetGrocery',
  'savoryGrocery',
  'bakery',
  'frozen',
  'beverages',
  'condiments',
  'other'
];

export function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const recipes = useStore((state) => state.recipes);
  const publicRecipes = useStore((state) => state.publicRecipes);
  const addRecipe = useStore((state) => state.addRecipe);
  const updateRecipe = useStore((state) => state.updateRecipe);
  const currentUser = useAuthStore((state) => state.currentUser);

  const existingRecipe = id ? [...recipes, ...publicRecipes].find(r => r.id === id) : null;

  const [name, setName] = useState(existingRecipe?.name || '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(existingRecipe?.ingredients || []);
  const [instructions, setInstructions] = useState(existingRecipe?.instructions || '');
  const [prepTime, setPrepTime] = useState(existingRecipe?.prepTime?.toString() || '');
  const [cookTime, setCookTime] = useState(existingRecipe?.cookTime?.toString() || '');
  const [servings, setServings] = useState(existingRecipe?.servings?.toString() || '');
  const [sourceUrl, setSourceUrl] = useState(existingRecipe?.sourceUrl || '');
  const [isPublic, setIsPublic] = useState(existingRecipe?.isPublic || false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(existingRecipe?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingRecipe) {
      setName(existingRecipe.name);
      setIngredients(existingRecipe.ingredients);
      setInstructions(existingRecipe.instructions);
      setPrepTime(existingRecipe.prepTime.toString());
      setCookTime(existingRecipe.cookTime.toString());
      setServings(existingRecipe.servings.toString());
      setSourceUrl(existingRecipe.sourceUrl || '');
      setIsPublic(existingRecipe.isPublic);
      setImagePreview(existingRecipe.image || null);
    }
  }, [existingRecipe]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setUploadError('File must be an image');
        return;
      }

      setImageFile(file);
      setUploadError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSubmitting(true);
    setUploadError(null);
    
    try {
      const recipeData = {
        name,
        ingredients: ingredients.map(ingredient => ({
          ...ingredient,
          quantity: Number(ingredient.quantity)
        })),
        instructions,
        prepTime: Number(prepTime),
        cookTime: Number(cookTime),
        servings: Number(servings),
        sourceUrl: sourceUrl || null,
        image: imagePreview,
        isPublic,
        createdBy: existingRecipe?.createdBy || {
          id: currentUser.id,
          name: currentUser.name
        },
        createdAt: existingRecipe?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (existingRecipe) {
        await updateRecipe(existingRecipe.id, recipeData);
      } else {
        await addRecipe(recipeData);
      }
      
      navigate('/recipes');
    } catch (error) {
      console.error('Error saving recipe:', error);
      setUploadError('Failed to save recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        id: crypto.randomUUID(),
        name: '',
        category: 'other',
        quantity: 1,
        unit: '',
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, updates: Partial<Ingredient>) => {
    setIngredients(
      ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, ...updates } : ingredient
      )
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            Recipe Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="ml-4">
          <label className="block text-sm font-medium text-gray-700">
            Visibility
          </label>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`mt-1 inline-flex items-center px-4 py-2 rounded-md ${
              isPublic
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isPublic ? (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Public
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Private
              </>
            )}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Recipe Image
        </label>
        <div className="mt-1 flex items-center space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </button>
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Recipe preview"
                className="h-20 w-20 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Recipe Source URL
        </label>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="https://example.com/recipe"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Ingredients
          </label>
          <button
            type="button"
            onClick={addIngredient}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Ingredient
          </button>
        </div>
        
        <div className="mt-2 space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={ingredient.id} className="flex gap-2">
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) =>
                  updateIngredient(index, { name: e.target.value })
                }
                placeholder="Ingredient name"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="number"
                value={ingredient.quantity}
                onChange={(e) =>
                  updateIngredient(index, { quantity: Number(e.target.value) })
                }
                placeholder="Qty"
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={ingredient.unit}
                onChange={(e) =>
                  updateIngredient(index, { unit: e.target.value })
                }
                placeholder="Unit"
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <select
                value={ingredient.category}
                onChange={(e) =>
                  updateIngredient(index, {
                    category: e.target.value as IngredientCategory,
                  })
                }
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {t(`categories.${category}`)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="text-red-600 hover:text-red-700"
              >
                <MinusCircle className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Instructions
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Prep Time (mins)
          </label>
          <input
            type="number"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cook Time (mins)
          </label>
          <input
            type="number"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Servings
          </label>
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving...' : existingRecipe ? 'Update Recipe' : 'Add Recipe'}
      </button>
    </form>
  );
}