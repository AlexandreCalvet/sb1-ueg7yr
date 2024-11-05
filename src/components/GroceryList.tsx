import React, { useState } from 'react';
import { Check, RefreshCw, Trash2, AlertCircle, Loader } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { IngredientCategory } from '../types';

export function GroceryList() {
  const groceryList = useStore((state) => state.groceryList);
  const toggleGroceryItem = useStore((state) => state.toggleGroceryItem);
  const clearGroceryList = useStore((state) => state.clearGroceryList);
  const updateGroceryList = useStore((state) => state.updateGroceryList);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);
  const organization = useAuthStore((state) => state.organization);

  const [updateError, setUpdateError] = useState<string | null>(null);

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view your grocery list.</p>
      </div>
    );
  }

  const handleUpdateList = async () => {
    setUpdateError(null);
    try {
      await updateGroceryList();
    } catch (error) {
      setUpdateError((error as Error).message);
    }
  };

  const handleClearList = async () => {
    if (!window.confirm('Are you sure you want to clear the grocery list?')) {
      return;
    }
    setUpdateError(null);
    try {
      await clearGroceryList();
    } catch (error) {
      setUpdateError((error as Error).message);
    }
  };

  const handleToggleItem = async (id: string) => {
    try {
      await toggleGroceryItem(id);
    } catch (error) {
      setUpdateError((error as Error).message);
    }
  };

  const groupedItems = groceryList.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<IngredientCategory, typeof groceryList>);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(error || updateError) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error || updateError}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Grocery List</h2>
        <div className="space-x-4">
          <button
            onClick={handleUpdateList}
            disabled={isLoading}
            className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleClearList}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {Object.keys(groupedItems).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Your grocery list is empty. Add recipes to your meal plan to generate a list.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {category}
              </h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleToggleItem(item.id)}
                            className={`flex items-center justify-center w-5 h-5 border rounded mr-3 ${
                              item.checked
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {item.checked && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </button>
                          <span
                            className={`text-sm ${
                              item.checked
                                ? 'text-gray-500 line-through'
                                : 'text-gray-900'
                            }`}
                          >
                            {item.quantity} {item.unit} {item.name}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}