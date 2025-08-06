import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brush, 
  Eraser, 
  Palette, 
  Download, 
  Save, 
  Undo, 
  Redo, 
  RotateCcw,
  Circle,
  Square,
  Minus,
  Loader2,
  PenTool,
  Paintbrush,
  Airplay,
  Droplets
} from 'lucide-react';

const ArtCanvas = ({ onSave, initialData = null }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('brush');
  const [brushType, setBrushType] = useState('normal'); // normal, pencil, marker, watercolor, spray
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [flow, setFlow] = useState(100);
  const [color, setColor] = useState('#000000');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Artwork metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
  ];

  const brushTypes = [
    { id: 'normal', name: 'Normal', icon: Brush, description: 'Standard brush' },
    { id: 'pencil', name: 'Pencil', icon: PenTool, description: 'Hard edge pencil' },
    { id: 'marker', name: 'Marker', icon: Paintbrush, description: 'Soft marker brush' },
    { id: 'watercolor', name: 'Watercolor', icon: Droplets, description: 'Watercolor effect' },
    { id: 'spray', name: 'Spray', icon: Airplay, description: 'Airbrush spray' }
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state
    saveToHistory();

    // Load initial data if provided
    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        saveToHistory();
      };
      img.src = initialData.imageUrl;
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setTags(initialData.tags ? initialData.tags.join(', ') : '');
      setIsPublic(initialData.isPublic !== false);
    }
  }, [initialData]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL();
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyIndex - 1];
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyIndex + 1];
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const applyBrushSettings = (ctx) => {
    const alpha = (opacity / 100);
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      
      switch (brushType) {
        case 'pencil':
          ctx.lineCap = 'square';
          ctx.lineJoin = 'miter';
          ctx.strokeStyle = color;
          ctx.globalAlpha = alpha;
          break;
        case 'marker':
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = color;
          ctx.globalAlpha = alpha * 0.7;
          break;
        case 'watercolor':
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.globalCompositeOperation = 'multiply';
          ctx.strokeStyle = color;
          ctx.globalAlpha = alpha * 0.3;
          break;
        case 'spray':
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = color;
          ctx.globalAlpha = alpha * 0.1;
          break;
        default: // normal
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = color;
          ctx.globalAlpha = alpha;
      }
    }
    
    ctx.lineWidth = brushSize;
  };

  const drawSpray = (ctx, x, y, size) => {
    const density = Math.floor(size * 2);
    for (let i = 0; i < density; i++) {
      const offsetX = (Math.random() - 0.5) * size;
      const offsetY = (Math.random() - 0.5) * size;
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      
      if (distance <= size / 2) {
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);
    
    applyBrushSettings(ctx);
    
    if (brushType === 'spray') {
      drawSpray(ctx, pos.x, pos.y, brushSize);
    } else {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);
    
    applyBrushSettings(ctx);
    
    if (brushType === 'spray') {
      drawSpray(ctx, pos.x, pos.y, brushSize);
    } else if (brushType === 'watercolor') {
      // Create watercolor effect with multiple overlapping strokes
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(pos.x + (Math.random() - 0.5) * 2, pos.y + (Math.random() - 0.5) * 2);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    } else {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${title || 'artwork'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your artwork');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const canvas = canvasRef.current;
      const imageBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });

      const canvasData = canvas.toDataURL();
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const artworkData = {
        title: title.trim(),
        description: description.trim(),
        tags: tagsArray,
        canvasData,
        isPublic,
        dimensions: {
          width: canvas.width,
          height: canvas.height
        },
        tools: [tool, brushType],
        colors: [color]
      };

      if (onSave) {
        await onSave(artworkData, imageBlob);
      }
    } catch (err) {
      setError('Failed to save artwork. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Canvas Area */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Digital Art Canvas</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {/* Tools */}
              <div className="flex gap-2">
                <Button
                  variant={tool === 'brush' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTool('brush')}
                  title="Brush Tool"
                >
                  <Brush className="h-4 w-4" />
                </Button>
                <Button
                  variant={tool === 'eraser' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTool('eraser')}
                  title="Eraser Tool"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              </div>

              {/* Brush Types (only show when brush tool is selected) */}
              {tool === 'brush' && (
                <div className="flex gap-2 border-l pl-4">
                  {brushTypes.map((brush) => {
                    const IconComponent = brush.icon;
                    return (
                      <Button
                        key={brush.id}
                        variant={brushType === brush.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBrushType(brush.id)}
                        title={brush.description}
                      >
                        <IconComponent className="h-4 w-4" />
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Brush Size */}
              <div className="flex items-center gap-2">
                <Label htmlFor="brushSize" className="text-sm">Size:</Label>
                <Input
                  id="brushSize"
                  type="range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm w-8">{brushSize}</span>
              </div>

              {/* Opacity Control */}
              {tool === 'brush' && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="opacity" className="text-sm">Opacity:</Label>
                  <Input
                    id="opacity"
                    type="range"
                    min="1"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm w-8">{opacity}%</span>
                </div>
              )}

              {/* History Controls */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCanvas}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadImage}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>

            {/* Color Palette */}
            <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Label className="text-sm">Colors:</Label>
              {colors.map((c) => (
                <button
                  key={c}
                  className={`w-8 h-8 rounded border-2 ${
                    color === c ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded border-2 border-gray-300"
              />
            </div>

            {/* Canvas */}
            <div className="border rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Artwork Details Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Artwork Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter artwork title"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your artwork..."
                rows={3}
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="abstract, digital, art (comma-separated)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isPublic">Make public</Label>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
                className="w-full"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Artwork'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArtCanvas;