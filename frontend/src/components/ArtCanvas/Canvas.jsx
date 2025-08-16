import React, { useEffect } from 'react';

const Canvas = ({
  canvasRef,
  gridCanvasRef,
  previewCanvasRef,
  tool,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  showGrid,
  gridSize,
  drawGrid
}) => {
  // Redraw grid when grid settings change
  useEffect(() => {
    drawGrid();
  }, [showGrid, gridSize, drawGrid]);

  return (
    <div className="border rounded-lg overflow-hidden bg-white flex justify-center mb-4 relative" style={{ height: '600px', width: '800px' }}>
      {/* Drawing Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 ${
          tool === 'text' ? 'cursor-text' : 
          tool === 'select' ? 'cursor-pointer' : 
          'cursor-crosshair'
        }`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
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
    </div>
  );
};

export default Canvas;
