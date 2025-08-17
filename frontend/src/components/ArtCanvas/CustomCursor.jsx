import React, { useEffect, useState, useCallback } from 'react';
import { 
  Brush, 
  Eraser, 
  PenTool, 
  Paintbrush, 
  Type,
  Minus,
  Square,
  Circle,
  Triangle,
  Star,
  Diamond,
  Hexagon,
  Pentagon,
  MousePointer
} from 'lucide-react';

const CustomCursor = ({ tool, brushType, brushSize, color, isVisible, position }) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Memoize the tool icon to avoid unnecessary re-renders
  const getToolIcon = useCallback(() => {
    switch (tool) {
      case 'brush':
        switch (brushType) {
          case 'normal':
            return Brush;
          case 'pencil':
            return PenTool;
          case 'marker':
            return Paintbrush;
          case 'fine':
            return Circle;
          default:
            return Brush;
        }
      case 'eraser':
        return Eraser;
      case 'text':
        return Type;
      case 'line':
        return Minus;
      case 'rectangle':
        return Square;
      case 'circle':
      case 'ellipse':
        return Circle;
      case 'triangle':
        return Triangle;
      case 'star':
        return Star;
      case 'diamond':
        return Diamond;
      case 'hexagon':
        return Hexagon;
      case 'pentagon':
        return Pentagon;
      case 'select':
        return MousePointer;
      default:
        return Brush;
    }
  }, [tool, brushType]);

  // Update cursor position with throttling for better performance
  useEffect(() => {
    if (position && (position.x !== cursorPosition.x || position.y !== cursorPosition.y)) {
      setCursorPosition(position);
    }
  }, [position, cursorPosition.x, cursorPosition.y]);

  const IconComponent = getToolIcon();

  // Don't render if not visible or if position is invalid
  if (!isVisible || !cursorPosition.x || !cursorPosition.y) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out custom-cursor"
      style={{
        left: cursorPosition.x,
        top: cursorPosition.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="relative">
        {/* Tool icon */}
        <div className="flex items-center justify-center w-6 h-6 bg-white border-2 border-gray-800 rounded-full shadow-lg">
          <IconComponent 
            className="w-3 h-3 text-gray-800" 
            style={{ color: tool === 'eraser' ? '#6B7280' : color }}
          />
        </div>
        
        {/* Brush size indicator for drawing tools */}
        {(tool === 'brush' || tool === 'eraser') && brushSize > 0 && (
          <div 
            className="absolute border-2 border-gray-800 rounded-full"
            style={{
              width: `${Math.max(brushSize, 4)}px`,
              height: `${Math.max(brushSize, 4)}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: tool === 'eraser' ? 'rgba(107, 114, 128, 0.3)' : `${color}40`,
              borderColor: tool === 'eraser' ? '#6B7280' : color
            }}
          />
        )}
        
        {/* Text tool indicator */}
        {tool === 'text' && (
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
        )}
        
        {/* Shape tool indicators */}
        {['rectangle', 'circle', 'triangle', 'star', 'diamond', 'hexagon', 'pentagon', 'ellipse'].includes(tool) && (
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
        )}
      </div>
    </div>
  );
};

export default CustomCursor;
