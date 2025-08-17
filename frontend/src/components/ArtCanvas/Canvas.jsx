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
    <div className="border rounded-lg overflow-hidden bg-white flex justify-center mb-4 relative canvas-container" style={{ height: '600px', width: '800px' }}>
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
  );
};

export default Canvas;
