import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TextModal = ({ 
  isOpen, 
  textInput, 
  setTextInput, 
  onSubmit, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Add Text</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="textInput">Text:</Label>
            <Input
              id="textInput"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter your text..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSubmit();
                } else if (e.key === 'Escape') {
                  onCancel();
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSubmit} className="flex-1">
              Add Text
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextModal;

