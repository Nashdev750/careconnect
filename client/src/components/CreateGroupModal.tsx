import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface CreateGroupModalProps {
  onClose: () => void;
  onSubmit: (name: string, description: string, category: string) => void;
}

export function CreateGroupModal({ onClose, onSubmit }: CreateGroupModalProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Group name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!category.trim()) newErrors.category = 'Category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(name, description, category);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <Input
            label="Group Name"
            name="name"
            placeholder="Enter group name"
            error={errors.name}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              className={`
                w-full rounded-lg border border-gray-300 p-2
                focus:outline-none focus:ring-2 focus:ring-rose-500
                ${errors.description ? 'border-red-300' : ''}
              `}
              rows={3}
              placeholder="Describe your group"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <Input
            label="Category"
            name="category"
            placeholder="e.g., Anxiety, Depression, Stress"
            error={errors.category}
          />

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Group
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}