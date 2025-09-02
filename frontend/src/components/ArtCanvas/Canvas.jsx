import React, { useEffect, useState, useCallback } from 'react';
import CustomCursor from './CustomCursor';

const Canvas = ({
  canvasRef,
  gridCanvasRef,
  previewCanvasRef,
  tool,
  brushType,
  brushSize,
  color,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  showGrid,
  gridSize,
  drawGrid
}) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isCursorVisible, setIsCursorVisible] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Handle responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      const maxWidth = Math.min(800, window.innerWidth - 64); // 64px for padding
      const maxHeight = Math.min(600, window.innerHeight - 200); // 200px for other elements
      const aspectRatio = 4/3;
      
      let width = maxWidth;
      let height = width / aspectRatio;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
      
      setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Update canvas dimensions when size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const gridCanvas = gridCanvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    
    if (canvas && gridCanvas && previewCanvas) {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      gridCanvas.width = canvasSize.width;
      gridCanvas.height = canvasSize.height;
      previewCanvas.width = canvasSize.width;
      previewCanvas.height = canvasSize.height;
      
      // Redraw grid with new dimensions
      drawGrid();
    }
  }, [canvasSize, drawGrid]);

  // Redraw grid when grid settings change
  useEffect(() => {
    drawGrid();
  }, [showGrid, gridSize, drawGrid]);

  // Handle mouse move for custom cursor with throttling
  const handleMouseMove = useCallback((e) => {
    // Update cursor position
    setCursorPosition({ x: e.clientX, y: e.clientY });
    setIsCursorVisible(true);
    
    // Call the original onMouseMove if it exists
    if (onMouseMove) {
      onMouseMove(e);
    }
  }, [onMouseMove]);

  // Handle mouse leave for custom cursor
  const handleMouseLeave = useCallback((e) => {
    setIsCursorVisible(false);
    
    // Call the original onMouseLeave if it exists
    if (onMouseLeave) {
      onMouseLeave(e);
    }
  }, [onMouseLeave]);

  // Handle mouse enter to show cursor again
  const handleMouseEnter = useCallback(() => {
    setIsCursorVisible(true);
  }, []);

  return (
    <div className="flex justify-center">
      <div 
        className="border rounded-lg overflow-hidden bg-white relative canvas-container"
        style={{ 
          width: `${canvasSize.width}px`, 
          height: `${canvasSize.height}px`,
          maxWidth: '100%'
        }}
      >
        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          onMouseDown={onMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        />
        {/* Preview Canvas for Shapes */}
        <canvas
          ref={previewCanvasRef}
          className="pointer-events-none absolute top-0 left-0"
          style={{ zIndex: 2 }}
        />
        {/* Grid Overlay Canvas */}
        <canvas
          ref={gridCanvasRef}
          className="pointer-events-none absolute top-0 left-0"
          style={{ zIndex: 1 }}
        />
        
        {/* Custom Cursor */}
        <CustomCursor
          tool={tool}
          brushType={brushType}
          brushSize={brushSize}
          color={color}
          isVisible={isCursorVisible}
          position={cursorPosition}
        />
      </div>
    </div>
  );
};

export default Canvas;
