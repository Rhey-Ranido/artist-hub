import React from 'react';

const ColorPalette = ({ colors, selectedColor, onColorSelect }) => {
  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Colors</div>
      <div className="grid grid-cols-6 gap-1">
        {colors.slice(0, 12).map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded border-2 ${
              selectedColor === color ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            title={color}
          />
        ))}
      </div>
      <div className="grid grid-cols-6 gap-1">
        {colors.slice(12).map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded border-2 ${
              selectedColor === color ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            title={color}
          />
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onColorSelect(e.target.value)}
          className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
          title="Custom Color"
        />
      </div>
    </div>
  );
};

export default ColorPalette;

