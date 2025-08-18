import React, { useEffect, useState, useCallback } from 'react';
import { 
  Brush, 
  Eraser, 
  PenTool, 
  Paintbrush, 
  Droplets,
  Palette,
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
          case 'droplet':
            return Droplets;
          case 'oil':
            return Palette;
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
        
        {/* Brush size indicator for drawing tools (distinct per type, visible even at small sizes) */}
        {tool === 'eraser' && brushSize > 0 && (
          <div
            className="absolute rounded-full"
            style={{
              width: `${Math.max(brushSize, 6)}px`,
              height: `${Math.max(brushSize, 6)}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(107, 114, 128, 0.25)',
              border: '2px solid #6B7280'
            }}
          />
        )}

        {tool === 'brush' && brushSize > 0 && (
          <>
            {brushType === 'pencil' && (
              <div
                className="absolute"
                style={{
                  width: `${Math.max(brushSize, 6)}px`,
                  height: `${Math.max(brushSize, 6)}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                  border: `2px solid ${color}`,
                  borderRadius: '2px',
                  backgroundColor: `${color}10`
                }}
              />
            )}

            {brushType === 'marker' && (
              <div
                className="absolute rounded-full"
                style={{
                  width: `${Math.max(brushSize, 6)}px`,
                  height: `${Math.max(brushSize, 6)}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: `${color}33`,
                  border: `2px dashed ${color}`,
                  boxShadow: `0 0 0 3px ${color}22`
                }}
              />
            )}

            {brushType === 'fine' && (
              <>
                <div
                  className="absolute rounded-full"
                  style={{
                    width: `${Math.max(brushSize, 6)}px`,
                    height: `${Math.max(brushSize, 6)}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: `1px solid ${color}`,
                    backgroundColor: 'transparent'
                  }}
                />
                {/* Crosshair */}
                <div
                  className="absolute"
                  style={{
                    width: `${Math.max(brushSize, 6)}px`,
                    height: '1px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: color
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    width: '1px',
                    height: `${Math.max(brushSize, 6)}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: color
                  }}
                />
              </>
            )}

            {brushType === 'crayon' && (
              <>
                <div
                  className="absolute rounded-full"
                  style={{
                    width: `${Math.max(brushSize, 6)}px`,
                    height: `${Math.max(brushSize, 6)}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: `2px dotted ${color}`,
                    backgroundColor: `${color}1a`
                  }}
                />
                {[...Array(3)].map((_, i) => {
                  const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
                  const dist = Math.max(6, brushSize) * 0.6;
                  const x = Math.cos(angle) * dist;
                  const y = Math.sin(angle) * dist;
                  return (
                    <div key={i}
                      className="absolute rounded-full"
                      style={{
                        width: '2px',
                        height: '2px',
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: color,
                        opacity: 0.7
                      }}
                    />
                  );
                })}
              </>
            )}

            {brushType === 'oil' && (
              <>
                <div
                  className="absolute rounded-full"
                  style={{
                    width: `${Math.max(brushSize * 1.2, 8)}px`,
                    height: `${Math.max(brushSize * 1.2, 8)}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: `2px solid ${color}`,
                    boxShadow: `inset 0 0 4px ${color}66, 0 0 6px ${color}33`,
                    background: `radial-gradient(circle at 30% 30%, ${color}55, transparent 60%)`
                  }}
                />
                {[...Array(5)].map((_, i) => (
                  <div key={i}
                    className="absolute"
                    style={{
                      width: `${Math.max(brushSize * 0.2, 2)}px`,
                      height: '2px',
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) rotate(${i * 12}deg)`,
                      backgroundColor: color,
                      opacity: 0.5
                    }}
                  />
                ))}
              </>
            )}

            {brushType === 'droplet' && (
              <>
                <div
                  className="absolute rounded-full"
                  style={{
                    width: `${Math.max(brushSize, 6)}px`,
                    height: `${Math.max(brushSize, 6)}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: `${color}33`,
                    border: `2px solid ${color}`
                  }}
                />
                {/* small splash dots */}
                {[...Array(4)].map((_, i) => {
                  const angle = (i / 4) * Math.PI * 2;
                  const dist = Math.max(6, brushSize) * 0.8;
                  const x = Math.cos(angle) * dist;
                  const y = Math.sin(angle) * dist;
                  return (
                    <div key={i}
                      className="absolute rounded-full"
                      style={{
                        width: '3px',
                        height: '3px',
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: color
                      }}
                    />
                  );
                })}
              </>
            )}

            {(!['pencil', 'marker', 'fine', 'droplet'].includes(brushType)) && (
              <div
                className="absolute rounded-full"
                style={{
                  width: `${Math.max(brushSize, 6)}px`,
                  height: `${Math.max(brushSize, 6)}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: `${color}26`,
                  border: `2px solid ${color}`
                }}
              />
            )}
          </>
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
