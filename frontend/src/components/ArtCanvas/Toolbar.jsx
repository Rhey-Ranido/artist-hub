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
  Pentagon
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
  fontFamilies
}) => {
  return (
    <div className="flex flex-col gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      {/* Primary Tools Row */}
      <div className="flex items-center gap-2">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1 p-2 bg-white dark:bg-gray-700 rounded border">
          <Button
            variant={tool === 'brush' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('brush')}
            title="Brush Tool (Ctrl+B)"
            className="h-8 w-8 p-0"
          >
            <PenTool className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('eraser')}
            title="Eraser Tool (Ctrl+E)"
            className="h-8 w-8 p-0"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('text')}
            title="Text Tool (Ctrl+T)"
            className="h-8 w-8 p-0"
          >
            <Type className="h-4 w-4" />
          </Button>
        </div>

        {/* Brush Types */}
        <div className="flex items-center gap-1 p-2 bg-white dark:bg-gray-700 rounded border">
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
                className="h-8 w-8 p-0"
              >
                <IconComponent className="h-4 w-4" />
              </Button>
            );
          })}
        </div>

        {/* Shape Tools */}
        <div className="flex items-center gap-1 p-2 bg-white dark:bg-gray-700 rounded border">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide shape-tools-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <Button
              variant={tool === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('line')}
              title="Line Tool (Ctrl+L)"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('rectangle')}
              title="Rectangle Tool (Ctrl+R)"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('circle')}
              title="Circle Tool (Ctrl+C)"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'triangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('triangle')}
              title="Triangle Tool"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Triangle className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'star' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('star')}
              title="Star Tool"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Star className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'diamond' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('diamond')}
              title="Diamond Tool"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Diamond className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'hexagon' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('hexagon')}
              title="Hexagon Tool"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Hexagon className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'ellipse' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('ellipse')}
              title="Ellipse Tool"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'pentagon' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('pentagon')}
              title="Pentagon Tool"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Pentagon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selection Tool */}
        <div className="flex items-center gap-1 p-2 bg-white dark:bg-gray-700 rounded border">
          <Button
            variant={tool === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('select')}
            title="Select Tool (Ctrl+V)"
            className="h-8 w-8 p-0"
          >
            <MousePointer className="h-4 w-4" />
          </Button>
        </div>

        {/* Grid Toggle */}
        <div className="flex items-center gap-1 p-2 bg-white dark:bg-gray-700 rounded border">
          <Button
            variant={showGrid ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Secondary Controls Row */}
      <div className="flex items-center gap-4 p-2 bg-white dark:bg-gray-700 rounded border">
        {/* Brush Controls */}
        <div className="flex items-center gap-2">
          <Label htmlFor="brushSize" className="text-xs font-medium whitespace-nowrap">Size:</Label>
          <Input
            id="brushSize"
            type="number"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value) || 1)}
            className="w-12 h-7 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="opacity" className="text-xs font-medium whitespace-nowrap">Opacity:</Label>
          <Input
            id="opacity"
            type="number"
            min="1"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value) || 1)}
            className="w-12 h-7 text-xs"
          />
          <span className="text-xs">%</span>
        </div>

        {/* Fill Shapes Toggle */}
        {(tool === 'rectangle' || tool === 'circle') && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="fillShapes"
              checked={fillShapes}
              onChange={(e) => setFillShapes(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="fillShapes" className="text-xs font-medium">Fill</Label>
          </div>
        )}

        {/* Grid Size (when grid is shown) */}
        {showGrid && (
          <div className="flex items-center gap-2">
            <Label htmlFor="gridSize" className="text-xs font-medium">Grid:</Label>
            <Input
              id="gridSize"
              type="number"
              min="10"
              max="100"
              value={gridSize}
              onChange={(e) => setGridSize(parseInt(e.target.value) || 10)}
              className="w-12 h-7 text-xs"
            />
          </div>
        )}

        {/* Text Controls (when text tool is selected) */}
        {tool === 'text' && (
          <>
            <div className="flex items-center gap-2">
              <Label htmlFor="fontSize" className="text-xs font-medium">Font:</Label>
              <Input
                id="fontSize"
                type="number"
                min="8"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 24)}
                className="w-12 h-7 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="fontFamily" className="text-xs font-medium">Style:</Label>
              <select
                id="fontFamily"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="px-2 py-1 text-xs border rounded bg-white dark:bg-gray-700 h-7"
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

        {/* History Controls */}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="h-7 w-7 p-0"
          >
            <Undo className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="h-7 w-7 p-0"
          >
            <Redo className="h-3 w-3" />
          </Button>
        </div>

        {/* Save Button */}
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="h-7 px-3"
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
