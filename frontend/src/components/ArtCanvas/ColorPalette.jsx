import React from 'react';
import { Palette, Plus } from 'lucide-react';

const ColorPalette = ({ colors, selectedColor, onColorSelect }) => {
  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Colors</div>
      </div>
      
      {/* Color Grid - Compact */}
      <div className="grid grid-cols-8 gap-1">
        {colors.slice(0, 16).map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${
              selectedColor === color 
                ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            title={color}
          />
        ))}
      </div>
      
      {/* Secondary Colors - Compact */}
      <div className="grid grid-cols-8 gap-1">
        {colors.slice(16).map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${
              selectedColor === color 
                ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            title={color}
          />
        ))}
      </div>
      
      {/* Custom Color Picker - Compact */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex items-center gap-2">
          <Plus className="h-3 w-3 text-gray-500" />
          <span className="text-xs text-gray-500">Custom:</span>
        </div>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onColorSelect(e.target.value)}
          className="w-6 h-6 rounded border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
          title="Custom Color"
        />
        <span className="text-xs text-gray-400 font-mono">{selectedColor}</span>
      </div>
    </div>
  );
};

export default ColorPalette;

