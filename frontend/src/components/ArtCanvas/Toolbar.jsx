import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Brush, 
  Eraser, 
  PenTool, 
  Paintbrush, 
  Droplets,
  Type,
  Airplay,
  Minus,
  Square,
  Circle,
  Grid3X3,
  Undo,
  Redo,
  Save,
  Loader2,
  MousePointer,
  Triangle,
  Star,
  Diamond,
  Hexagon,
  Pentagon,
  Settings,
  Palette
} from 'lucide-react';

const Toolbar = ({
  tool,
  setTool,
  brushType,
  setBrushType,
  brushSize,
  setBrushSize,
  opacity,
  setOpacity,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  fillShapes,
  setFillShapes,
  showGrid,
  setShowGrid,
  gridSize,
  setGridSize,
  onUndo,
  onRedo,
  onSave,
  isSaving,
  canUndo,
  canRedo,
  brushTypes,
  fontFamilies,
  colors,
  selectedColor,
  onColorSelect
}) => {
  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      {/* Primary Tools Row - Compact */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1 p-1.5 bg-white dark:bg-gray-700 rounded border">
          <Button
            variant={tool === 'brush' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('brush')}
            title="Brush Tool (Ctrl+B)"
            className="h-7 w-7 p-0"
          >
            <PenTool className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('eraser')}
            title="Eraser Tool (Ctrl+E)"
            className="h-7 w-7 p-0"
          >
            <Eraser className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={tool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('text')}
            title="Text Tool (Ctrl+T)"
            className="h-7 w-7 p-0"
          >
            <Type className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Brush Types */}
        <div className="flex items-center gap-1 p-1.5 bg-white dark:bg-gray-700 rounded border">
          {brushTypes.map((brush) => {
            const IconComponent = brush.icon;
            return (
              <Button
                key={brush.id}
                variant={tool === 'brush' && brushType === brush.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setTool('brush');
                  setBrushType(brush.id);
                }}
                title={brush.description}
                className="h-7 w-7 p-0"
              >
                <IconComponent className="h-3.5 w-3.5" />
              </Button>
            );
          })}
        </div>

        {/* Shape Tools - Horizontal Scrollable */}
        <div className="flex items-center gap-1 p-1.5 bg-white dark:bg-gray-700 rounded border overflow-x-auto scrollbar-hide" style={{ maxWidth: '280px' }}>
          <Button
            variant={tool === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('line')}
            title="Line Tool (Ctrl+L)"
            className="h-7 w-7 p-0 flex-shrink-0"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={tool === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('rectangle')}
            title="Rectangle Tool (Ctrl+R)"
            className="h-7 w-7 p-0 flex-shrink-0"
          >
            <Square className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={tool === 'circle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('circle')}
            title="Circle Tool (Ctrl+C)"
            className="h-7 w-7 p-0 flex-shrink-0"
          >
            <Circle className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={tool === 'triangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('triangle')}
            title="Triangle Tool"
            className="h-7 w-7 p-0 flex-shrink-0"
          >
            <Triangle className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={tool === 'star' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('star')}
            title="Star Tool"
            className="h-7 w-7 p-0 flex-shrink-0"
          >
            <Star className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={tool === 'diamond' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('diamond')}
            title="Diamond Tool"
            className="h-7 w-7 p-0 flex-shrink-0"
          >
            <Diamond className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={tool === 'hexagon' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('hexagon')}
            title="Hexagon Tool"
            className="h-7 w-7 p-0 flex-shrink-0"
          >
            <Hexagon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={tool === 'ellipse' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('ellipse')}
            title="Ellipse Tool"
            className="h-7 w-7 p-0 flex-shrink-0"
          >
            <Circle className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={tool === 'pentagon' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('pentagon')}
            title="Pentagon Tool"
            className="h-7 w-7 p-0 flex-shrink-0"
          >
            <Pentagon className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Selection Tool */}
        <div className="flex items-center gap-1 p-1.5 bg-white dark:bg-gray-700 rounded border">
          <Button
            variant={tool === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('select')}
            title="Select Tool (Ctrl+V)"
            className="h-7 w-7 p-0"
          >
            <MousePointer className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Grid Toggle */}
        <div className="flex items-center gap-1 p-1.5 bg-white dark:bg-gray-700 rounded border">
          <Button
            variant={showGrid ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
            className="h-7 w-7 p-0"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Color Palette - Integrated */}
        <div className="flex items-center gap-1 p-1.5 bg-white dark:bg-gray-700 rounded border">
          <div className="flex items-center gap-1">
            <Palette className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
            <div className="grid grid-cols-8 gap-0.5">
              {colors.slice(0, 8).map((color) => (
                <button
                  key={color}
                  className={`w-4 h-4 rounded border transition-all duration-200 hover:scale-110 ${
                    selectedColor === color 
                      ? 'border-blue-500 ring-1 ring-blue-300 shadow-sm' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorSelect(color)}
                  title={color}
                />
              ))}
            </div>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => onColorSelect(e.target.value)}
              className="w-5 h-5 rounded border border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
              title="Custom Color"
            />
          </div>
        </div>
      </div>

      {/* Compact Controls Row */}
      <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-700 rounded border flex-wrap">
        {/* Brush Controls - Compact */}
        <div className="flex items-center gap-2">
          <Label htmlFor="brushSize" className="text-xs font-medium text-gray-600 dark:text-gray-400">Size</Label>
          <div className="flex items-center gap-1">
            <input
              type="range"
              id="brushSize"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-16 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs text-gray-500 w-8 text-center">{brushSize}</span>
          </div>
        </div>

        {/* Opacity Control - Compact */}
        <div className="flex items-center gap-2">
          <Label htmlFor="opacity" className="text-xs font-medium text-gray-600 dark:text-gray-400">Opacity</Label>
          <div className="flex items-center gap-1">
            <input
              type="range"
              id="opacity"
              min="1"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(parseInt(e.target.value))}
              className="w-16 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs text-gray-500 w-8 text-center">{opacity}%</span>
          </div>
        </div>

        {/* Grid Size - Compact */}
        {showGrid && (
          <div className="flex items-center gap-2">
            <Label htmlFor="gridSize" className="text-xs font-medium text-gray-600 dark:text-gray-400">Grid</Label>
            <div className="flex items-center gap-1">
              <input
                type="range"
                id="gridSize"
                min="10"
                max="100"
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value))}
                className="w-16 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-500 w-8 text-center">{gridSize}</span>
            </div>
          </div>
        )}

        {/* Fill Shapes Toggle - Compact */}
        {(tool === 'rectangle' || tool === 'circle' || tool === 'triangle' || tool === 'star' || tool === 'diamond' || tool === 'hexagon' || tool === 'ellipse' || tool === 'pentagon') && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="fillShapes"
              checked={fillShapes}
              onChange={(e) => setFillShapes(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="fillShapes" className="text-xs font-medium text-gray-600 dark:text-gray-400">Fill</Label>
          </div>
        )}

        {/* Text Controls - Compact */}
        {tool === 'text' && (
          <>
            <div className="flex items-center gap-2">
              <Label htmlFor="fontSize" className="text-xs font-medium text-gray-600 dark:text-gray-400">Font</Label>
              <div className="flex items-center gap-1">
                <input
                  type="range"
                  id="fontSize"
                  min="8"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-16 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-500 w-8 text-center">{fontSize}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="fontFamily" className="text-xs font-medium text-gray-600 dark:text-gray-400">Style</Label>
              <select
                id="fontFamily"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="px-2 py-1 text-xs border rounded bg-white dark:bg-gray-700 h-6 min-w-0"
              >
                {fontFamilies.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* History Controls - Compact */}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="h-6 w-6 p-0"
          >
            <Undo className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="h-6 w-6 p-0"
          >
            <Redo className="h-3 w-3" />
          </Button>
        </div>

        {/* Save Button - Compact */}
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="h-6 px-2 text-xs"
        >
          {isSaving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
