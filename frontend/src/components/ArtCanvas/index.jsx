import React, { useRef, useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brush,
  PenTool,
  Paintbrush,
  Droplets,
  Palette,
  Type,
  MousePointer,
  Circle,
  Square,
  Minus,
} from "lucide-react";

// Import components
import Toolbar from "./Toolbar";
import Canvas from "./Canvas";
import TextModal from "./TextModal";
import ArtworkDetails from "./ArtworkDetails";

const ArtCanvas = ({ onSave, initialData = null, onDirtyChange = () => {} }) => {
  const canvasRef = useRef(null);
  const gridCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("brush");
  const [brushType, setBrushType] = useState("normal");
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [color, setColor] = useState("#000000");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);

  // New tool states
  const [startPoint, setStartPoint] = useState(null);
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fillShapes, setFillShapes] = useState(false);
  const [lastDrawPos, setLastDrawPos] = useState(null);

  // Shape selection and transformation states
  const [selectedShape, setSelectedShape] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
  const [hoveredHandle, setHoveredHandle] = useState(null); // Track which handle is being hovered
  const [originalShapes, setOriginalShapes] = useState([]); // Store original shapes before transformation

  // Transformation history for undo/redo of shape operations
  const [transformHistory, setTransformHistory] = useState([]);
  const [transformIndex, setTransformIndex] = useState(-1);

  // Artwork metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // Wrapper functions to track form changes as dirty
  const handleTitleChange = (value) => {
    setTitle(value);
    onDirtyChange(true);
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    onDirtyChange(true);
  };

  const handleTagsChange = (value) => {
    setTags(value);
    onDirtyChange(true);
  };

  const handlePublicChange = (value) => {
    setIsPublic(value);
    onDirtyChange(true);
  };

  const colors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#FFC0CB",
    "#A52A2A",
    "#808080",
    "#000080",
    "#008000",
  ];

  const brushTypes = [
    {
      id: "normal",
      name: "Normal",
      icon: Brush,
      description: "Standard brush",
    },
    {
      id: "pencil",
      name: "Pencil",
      icon: PenTool,
      description: "Hard edge pencil",
    },
    {
      id: "marker",
      name: "Marker",
      icon: Paintbrush,
      description: "Soft marker brush",
    },
    {
      id: "fine",
      name: "Fine",
      icon: Circle,
      description: "Fine detail brush",
    },
    {
      id: "droplet",
      name: "Droplet",
      icon: Droplets,
      description: "Add droplets of color",
    },
    {
      id: "crayon",
      name: "Crayon",
      icon: Paintbrush,
      description: "Smudgy crayon tool",
    },
    {
      id: "oil",
      name: "Oil",
      icon: Palette,
      description: "Thick oil paint with bristle texture",
    },
  ];

  // // Centralized, easy-to-tweak brush configuration
  // const BRUSH_CONFIG = {
  //   normal: {
  //     lineCap: 'round',
  //     lineJoin: 'round',
  //     alphaMultiplier: 1.0,
  //     underlay: { enabled: true, widthScale: 1.3, alpha: 0.15 },
  //     watercolor: {
  //       enabled: true,
  //       strokesPerSizeDivisor: 3, // watercolorStrokes = max(2, floor(brushSize / divisor))
  //       offsetScale: 0.8,
  //       widthMinScale: 0.3,
  //       widthMaxScale: 1.0,
  //       alphaMin: 0.2,
  //       alphaMax: 0.4
  //     }
  //   },
  //   marker: {
  //     lineCap: 'round',
  //     lineJoin: 'round',
  //     alphaMultiplier: 0.7,
  //     underlay: { enabled: true, widthScale: 1.6, alpha: 0.25 },
  //     crossHatch: { enabled: true, minBrushSize: 3, offsetScale: 0.6, widthScale: 0.4, alpha: 0.5 },
  //     stipple: { enabled: true, minBrushSize: 1, dotCountDivisor: 2, alpha: 0.7, offsetScaleMin: 0.8 },
  //     pressure: { enabled: true, minBrushSize: 5, centerWidthScale: 0.8, centerAlpha: 0.6, edgeWidthScale: 0.3, edgeAlpha: 0.4 }
  //   },
  //   pencil: {
  //     lineCap: 'square',
  //     lineJoin: 'miter',
  //     alphaMultiplier: 0.2, // easy tweak for pencil lightness
  //     texture: { enabled: true, lineCount: 2, lineWidthScale: 0.3, alpha: 0.35, dash: true, dashMain: 1.0, dashGap: 1.2 }
  //   },
  //   fine: {
  //     lineCap: 'round',
  //     lineJoin: 'round',
  //     alphaMultiplier: 1.0,
  //     widthScale: 0.5
  //   }
  // };
  const BRUSH_CONFIG = {
    normal: {
      // Soft watercolor look
      lineCap: "round",
      lineJoin: "round",
      alphaMultiplier: 0.6,
      underlay: { enabled: true, widthScale: 2.0, alpha: 0.1 }, // big soft bleed
      // watercolor: {
      //   enabled: true,
      //   strokesPerSizeDivisor: 2, // more overlap
      //   offsetScale: 1.2,
      //   widthMinScale: 0.4,
      //   widthMaxScale: 1.5,
      //   alphaMin: 0.1,
      //   alphaMax: 0.3
      // }
    },

    marker: {
      // Heavy, bold, streaky
      lineCap: "butt",
      lineJoin: "bevel",
      alphaMultiplier: 0.9,
      underlay: { enabled: true, widthScale: 1.2, alpha: 0.35 },
      crossHatch: {
        enabled: true,
        minBrushSize: 2,
        offsetScale: 0.8,
        widthScale: 0.5,
        alpha: 0.6,
      },
      streaks: { enabled: true, count: 3, alpha: 0.3, widthJitter: 0.5 }, // new streak effect
      pressure: {
        enabled: true,
        minBrushSize: 6,
        centerWidthScale: 1.0,
        centerAlpha: 0.9,
        edgeWidthScale: 0.2,
        edgeAlpha: 0.3,
      },
    },

    pencil: {
      // Scratchy graphite texture
      lineCap: "square",
      lineJoin: "miter",
      alphaMultiplier: 0.15,
      texture: {
        enabled: true,
        lineCount: 4,
        lineWidthScale: 0.25,
        alpha: 0.4,
        dash: true,
        dashMain: 0.5,
        dashGap: 1.5,
      },
      jitter: { enabled: true, offsetScale: 0.4, alphaJitter: 0.3 }, // slight hand-drawn shake
    },

    fine: {
      // Clean technical pen
      lineCap: "round",
      lineJoin: "round",
      alphaMultiplier: 1.0,
      widthScale: 0.2,
      antiAlias: true,
      noTexture: true,
    },
    droplet: {
      // Splashy droplet tool
      lineCap: "round",
      lineJoin: "round",
      alphaMultiplier: 1.0,
      radiusScale: 0.8, // base droplet radius = brushSize * radiusScale
      splashCount: 6,
      splashRadiusScaleMin: 0.15,
      splashRadiusScaleMax: 0.35,
      splashDistanceMin: 0.8, // in multiples of base radius
      splashDistanceMax: 2.0,
      splashAlpha: 0.6,
    },
    crayon: {
      // Waxy, smudgy crayon
      lineCap: "round",
      lineJoin: "round",
      alphaMultiplier: 0.85,
      grainLines: 3,
      grainAlpha: 0.35,
      jitterScale: 0.25,
      dotCountDivisor: 1.5,
      dotAlpha: 0.25,
      smudge: {
        enabled: true,
        sampleRadius: 6,
        picks: 10,
        alpha: 0.25,
        blurPx: 1.2,
      },
    },
    oil: {
      // Thick paint with bristle streaks and mild blending
      lineCap: "round",
      lineJoin: "round",
      alphaMultiplier: 1.0,
      bristles: 8,
      bristleAlpha: 0.6,
      bristleWidthJitter: 0.3,
      bristleOffsetScale: 0.5,
      bodyWidthScale: 0.8,
      bodyAlpha: 0.85,
      blend: { enabled: true, sampleRadius: 5, alpha: 0.2 },
      watercolor: {
        enabled: true,
        strokesPerSizeDivisor: 5, // more overlap
        offsetScale: 1.2,
        widthMinScale: 0.4,
        widthMaxScale: 1.5,
        alphaMin: 0.1,
        alphaMax: 0.3,
      },
    },
  };

  const fontFamilies = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Courier New",
    "Impact",
    "Comic Sans MS",
    "Tahoma",
    "Trebuchet MS",
  ];

  // Grid drawing function for overlay canvas
  const drawGrid = useCallback(() => {
    const gridCanvas = gridCanvasRef.current;
    if (!gridCanvas) return;

    const ctx = gridCanvas.getContext("2d");
    const width = gridCanvas.width;
    const height = gridCanvas.height;

    // Always clear the grid canvas first
    ctx.clearRect(0, 0, width, height);

    // Only draw grid if showGrid is true
    if (!showGrid) return;

    // Set grid style
    ctx.strokeStyle = "#9CA3AF";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [showGrid, gridSize]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const gridCanvas = gridCanvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !gridCanvas || !previewCanvas) return;

    const ctx = canvas.getContext("2d");

    // Set canvas sizes - will be updated by Canvas component
    canvas.width = 800;
    canvas.height = 600;
    gridCanvas.width = 800;
    gridCanvas.height = 600;
    previewCanvas.width = 800;
    previewCanvas.height = 600;

    // Set default styles for drawing canvas
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    const imageData = canvas.toDataURL();
    setHistory([imageData]);
    setHistoryIndex(0);

    // Load initial data if provided
    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const newImageData = canvas.toDataURL();
        setHistory([newImageData]);
        setHistoryIndex(0);
      };
      img.src = initialData.imageUrl;
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setTags(initialData.tags ? initialData.tags.join(", ") : "");
      setIsPublic(initialData.isPublic !== false);
    }
  }, [initialData]);

  // Render shapes with selection indicators
  const renderShapes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Clear the entire canvas first to prevent duplication
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw all shapes
    shapes.forEach((shape) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = shape.color;
      ctx.fillStyle = shape.color;
      ctx.globalAlpha = shape.opacity;
      ctx.lineWidth = shape.lineWidth;

      switch (shape.type) {
        case "line":
          ctx.beginPath();
          ctx.moveTo(shape.startX, shape.startY);
          ctx.lineTo(shape.endX, shape.endY);
          ctx.stroke();
          break;
        case "rectangle":
          ctx.beginPath();
          ctx.rect(shape.x, shape.y, shape.width, shape.height);
          if (shape.filled) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        case "circle":
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
          if (shape.filled) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        case "triangle":
          ctx.beginPath();
          ctx.moveTo(shape.x + shape.width / 2, shape.y);
          ctx.lineTo(shape.x, shape.y + shape.height);
          ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
          ctx.closePath();
          if (shape.filled) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        case "star": {
          const starCenterX = shape.x + shape.width / 2;
          const starCenterY = shape.y + shape.height / 2;
          const starOuterRadius = Math.min(shape.width, shape.height) / 2;
          const starInnerRadius = starOuterRadius * 0.4;
          const starSpikes = 5;

          ctx.beginPath();
          for (let i = 0; i < starSpikes * 2; i++) {
            const angle = (i * Math.PI) / starSpikes;
            const radius = i % 2 === 0 ? starOuterRadius : starInnerRadius;
            const x = starCenterX + Math.cos(angle) * radius;
            const y = starCenterY + Math.sin(angle) * radius;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          if (shape.filled) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        }
        case "diamond": {
          const diamondCenterX = shape.x + shape.width / 2;
          const diamondCenterY = shape.y + shape.height / 2;

          ctx.beginPath();
          ctx.moveTo(diamondCenterX, shape.y);
          ctx.lineTo(shape.x + shape.width, diamondCenterY);
          ctx.lineTo(diamondCenterX, shape.y + shape.height);
          ctx.lineTo(shape.x, diamondCenterY);
          ctx.closePath();
          if (shape.filled) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        }
        case "hexagon": {
          const hexCenterX = shape.x + shape.width / 2;
          const hexCenterY = shape.y + shape.height / 2;
          const hexRadius = Math.min(shape.width, shape.height) / 2;

          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = hexCenterX + Math.cos(angle) * hexRadius;
            const y = hexCenterY + Math.sin(angle) * hexRadius;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          if (shape.filled) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        }
        case "ellipse": {
          const ellipseCenterX = shape.x + shape.width / 2;
          const ellipseCenterY = shape.y + shape.height / 2;
          const radiusX = shape.width / 2;
          const radiusY = shape.height / 2;

          ctx.beginPath();
          ctx.ellipse(
            ellipseCenterX,
            ellipseCenterY,
            radiusX,
            radiusY,
            0,
            0,
            2 * Math.PI
          );
          if (shape.filled) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        }
        case "pentagon": {
          const pentCenterX = shape.x + shape.width / 2;
          const pentCenterY = shape.y + shape.height / 2;
          const pentRadius = Math.min(shape.width, shape.height) / 2;

          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const x = pentCenterX + Math.cos(angle) * pentRadius;
            const y = pentCenterY + Math.sin(angle) * pentRadius;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          if (shape.filled) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        }
      }

      // Draw selection indicators
      if (shape.id === selectedShape) {
        ctx.strokeStyle = "#0066FF";
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        ctx.setLineDash([5, 5]);

        switch (shape.type) {
          case "line":
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke();
            break;
          case "rectangle":
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            break;
          case "circle":
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
          case "triangle": {
            ctx.beginPath();
            ctx.moveTo(shape.x + shape.width / 2, shape.y);
            ctx.lineTo(shape.x, shape.y + shape.height);
            ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
            ctx.closePath();
            ctx.stroke();
            break;
          }
          case "star": {
            const starCenterX = shape.x + shape.width / 2;
            const starCenterY = shape.y + shape.height / 2;
            const starOuterRadius = Math.min(shape.width, shape.height) / 2;
            const starInnerRadius = starOuterRadius * 0.4;
            const starSpikes = 5;

            ctx.beginPath();
            for (let i = 0; i < starSpikes * 2; i++) {
              const angle = (i * Math.PI) / starSpikes;
              const radius = i % 2 === 0 ? starOuterRadius : starInnerRadius;
              const x = starCenterX + Math.cos(angle) * radius;
              const y = starCenterY + Math.sin(angle) * radius;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.closePath();
            ctx.stroke();
            break;
          }
          case "diamond": {
            const diamondCenterX = shape.x + shape.width / 2;
            const diamondCenterY = shape.y + shape.height / 2;

            ctx.beginPath();
            ctx.moveTo(diamondCenterX, shape.y);
            ctx.lineTo(shape.x + shape.width, diamondCenterY);
            ctx.lineTo(diamondCenterX, shape.y + shape.height);
            ctx.lineTo(shape.x, diamondCenterY);
            ctx.closePath();
            ctx.stroke();
            break;
          }
          case "hexagon": {
            const hexCenterX = shape.x + shape.width / 2;
            const hexCenterY = shape.y + shape.height / 2;
            const hexRadius = Math.min(shape.width, shape.height) / 2;

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3;
              const x = hexCenterX + Math.cos(angle) * hexRadius;
              const y = hexCenterY + Math.sin(angle) * hexRadius;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.closePath();
            ctx.stroke();
            break;
          }
          case "ellipse": {
            const ellipseCenterX = shape.x + shape.width / 2;
            const ellipseCenterY = shape.y + shape.height / 2;
            const radiusX = shape.width / 2;
            const radiusY = shape.height / 2;

            ctx.beginPath();
            ctx.ellipse(
              ellipseCenterX,
              ellipseCenterY,
              radiusX,
              radiusY,
              0,
              0,
              2 * Math.PI
            );
            ctx.stroke();
            break;
          }
          case "pentagon": {
            const pentCenterX = shape.x + shape.width / 2;
            const pentCenterY = shape.y + shape.height / 2;
            const pentRadius = Math.min(shape.width, shape.height) / 2;

            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
              const x = pentCenterX + Math.cos(angle) * pentRadius;
              const y = pentCenterY + Math.sin(angle) * pentRadius;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.closePath();
            ctx.stroke();
            break;
          }
        }

        // Draw resize handles with enhanced visibility and hover effects
        ctx.setLineDash([]);
        ctx.fillStyle = "#0066FF";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        const handles = getShapeHandles(shape);
        handles.forEach((handle) => {
          // Check if this handle is being hovered
          const isHovered = hoveredHandle === handle.type;
          const handleSize = isHovered ? 8 : 5; // Bigger when hovered

          ctx.beginPath();
          ctx.arc(handle.x, handle.y, handleSize, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          // Add glow effect for hovered handles
          if (isHovered) {
            ctx.shadowColor = "rgba(0, 102, 255, 0.6)";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(handle.x, handle.y, handleSize + 2, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset shadow
          }
        });
      }
    });
  }, [shapes, selectedShape, hoveredHandle]);

  // Render shapes when they change
  useEffect(() => {
    renderShapes();
  }, [shapes, selectedShape, renderShapes]);

  // Save transformation to history
  const saveTransform = useCallback(
    (oldShapes, newShapes) => {
      const transform = {
        oldShapes: [...oldShapes],
        newShapes: [...newShapes],
        timestamp: Date.now(),
      };

      setTransformHistory((prev) => {
        const newHistory = prev.slice(0, transformIndex + 1);
        newHistory.push(transform);
        return newHistory;
      });
      setTransformIndex((prev) => prev + 1);
    },
    [transformIndex]
  );

  // Delete selected shape
  const deleteSelectedShape = () => {
    if (selectedShape) {
      setShapes((prev) => prev.filter((shape) => shape.id !== selectedShape));
      setSelectedShape(null);
      saveToHistory();
      onDirtyChange(true); // Mark as dirty after deleting shape
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "t":
            e.preventDefault();
            setTool("text");
            break;
          case "b":
            e.preventDefault();
            setTool("brush");
            break;
          case "e":
            e.preventDefault();
            setTool("eraser");
            break;
          case "l":
            e.preventDefault();
            setTool("line");
            break;
          case "r":
            e.preventDefault();
            setTool("rectangle");
            break;
          case "c":
            e.preventDefault();
            setTool("circle");
            break;
          case "v":
            e.preventDefault();
            setTool("select");
            break;
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case "y":
            e.preventDefault();
            redo();
            break;
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedShape) {
          deleteSelectedShape();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedShape]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save the current canvas state (including shapes and brush strokes)
    const imageData = canvas.toDataURL();
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Combined undo function that handles both drawing history and shape transformations
  const undo = () => {
    // First try to undo shape transformations if available
    if (transformIndex > 0) {
      setTransformIndex((prev) => prev - 1);
      const transform = transformHistory[transformIndex - 1];
      setShapes(transform.oldShapes);
      return;
    }

    // If no shape transformations to undo, undo drawing history
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        // Re-render shapes after restoring canvas state
        renderShapes();
      };
      img.src = history[historyIndex - 1];
    }
  };

  // Combined redo function that handles both drawing history and shape transformations
  const redo = () => {
    // First try to redo shape transformations if available
    if (transformIndex < transformHistory.length - 1) {
      setTransformIndex((prev) => prev + 1);
      const transform = transformHistory[transformIndex + 1];
      setShapes(transform.newShapes);
      return;
    }

    // If no shape transformations to redo, redo drawing history
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        // Re-render shapes after restoring canvas state
        renderShapes();
      };
      img.src = history[historyIndex + 1];
    }
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const applyBrushSettings = (ctx) => {
    const alpha = opacity / 100;

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
    } else {
      ctx.globalCompositeOperation = "source-over";
      const cfg = BRUSH_CONFIG[brushType] || BRUSH_CONFIG.normal;
      ctx.lineCap = cfg.lineCap;
      ctx.lineJoin = cfg.lineJoin;
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha * (cfg.alphaMultiplier ?? 1.0);
    }

    ctx.lineWidth = brushSize;
  };

  // Enhanced brush stroke functions for different brush types
  const drawBrushStroke = (
    ctx,
    startPos,
    endPos,
    brushType,
    brushSize,
    opacity,
    color
  ) => {
    const alpha = opacity / 100;

    switch (brushType) {
      case "oil": {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineCap = BRUSH_CONFIG.oil.lineCap;
        ctx.lineJoin = BRUSH_CONFIG.oil.lineJoin;

        // Body stroke
        ctx.lineWidth = Math.max(
          1,
          brushSize * (BRUSH_CONFIG.oil.bodyWidthScale ?? 1.2)
        );
        ctx.globalAlpha = alpha * (BRUSH_CONFIG.oil.bodyAlpha ?? 0.85);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();

        // Bristle streaks
        const bristles = BRUSH_CONFIG.oil.bristles ?? 8;
        for (let i = 0; i < bristles; i++) {
          const off =
            (i / (bristles - 1) - 0.5) *
            (BRUSH_CONFIG.oil.bristleOffsetScale ?? 0.5) *
            brushSize *
            2;
          ctx.lineWidth = Math.max(
            0.5,
            brushSize *
              0.3 *
              (0.6 +
                Math.random() * (BRUSH_CONFIG.oil.bristleWidthJitter ?? 0.6))
          );
          ctx.globalAlpha = alpha * (BRUSH_CONFIG.oil.bristleAlpha ?? 0.6);
          ctx.beginPath();
          ctx.moveTo(startPos.x + off, startPos.y + off);
          ctx.lineTo(endPos.x + off, endPos.y + off);
          ctx.stroke();
        }

        // Mild blend: sample nearby color and glaze
        if (BRUSH_CONFIG.oil.blend?.enabled && canvasRef.current) {
          const canvas = canvasRef.current;
          const bctx = canvas.getContext("2d");
          // const sampleRadius = BRUSH_CONFIG.oil.blend.sampleRadius ?? 5; // reserved for future radial sampling
          const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
          const sx = clamp(Math.floor(endPos.x), 0, canvas.width - 1);
          const sy = clamp(Math.floor(endPos.y), 0, canvas.height - 1);
          try {
            const data = bctx.getImageData(sx, sy, 1, 1).data;
            const col = `rgba(${data[0]},${data[1]},${data[2]},${(
              (data[3] / 255) *
              (BRUSH_CONFIG.oil.blend.alpha ?? 0.2)
            ).toFixed(3)})`;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.arc(
              endPos.x,
              endPos.y,
              Math.max(1, brushSize * 0.4),
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.restore();
          } catch {
            // ignore sampling errors
          }
        }
        break;
      }
      case "crayon": {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineCap = BRUSH_CONFIG.crayon.lineCap;
        ctx.lineJoin = BRUSH_CONFIG.crayon.lineJoin;

        // Grainy multi-line stroke
        const grains = BRUSH_CONFIG.crayon.grainLines ?? 3;
        for (let i = 0; i < grains; i++) {
          const jitter = (BRUSH_CONFIG.crayon.jitterScale ?? 0.25) * brushSize;
          const offX = (Math.random() - 0.5) * jitter;
          const offY = (Math.random() - 0.5) * jitter;
          ctx.lineWidth = Math.max(
            1,
            brushSize * 0.6 * (0.9 + Math.random() * 0.2)
          );
          ctx.globalAlpha = alpha * (BRUSH_CONFIG.crayon.grainAlpha ?? 0.35);
          ctx.beginPath();
          ctx.moveTo(startPos.x + offX, startPos.y + offY);
          ctx.lineTo(endPos.x + offX, endPos.y + offY);
          ctx.stroke();
        }

        // Speckled dots along the stroke
        const dotCount = Math.max(
          2,
          Math.floor(
            (brushSize > 0 ? brushSize : 1) /
              (BRUSH_CONFIG.crayon.dotCountDivisor ?? 1.5)
          )
        );
        for (let i = 0; i < dotCount; i++) {
          const t = Math.random();
          const x =
            startPos.x +
            (endPos.x - startPos.x) * t +
            (Math.random() - 0.5) * brushSize * 0.5;
          const y =
            startPos.y +
            (endPos.y - startPos.y) * t +
            (Math.random() - 0.5) * brushSize * 0.5;
          const r = Math.max(0.5, brushSize * 0.15 * (0.5 + Math.random()));
          ctx.globalAlpha = alpha * (BRUSH_CONFIG.crayon.dotAlpha ?? 0.25);
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Light smudge: pick surrounding colors and lay soft circles along stroke
        if (BRUSH_CONFIG.crayon.smudge?.enabled && canvasRef.current) {
          const sampleRadius = BRUSH_CONFIG.crayon.smudge.sampleRadius ?? 6;
          const picks = BRUSH_CONFIG.crayon.smudge.picks ?? 8;
          const blurPx = BRUSH_CONFIG.crayon.smudge.blurPx ?? 1.5;
          const canvas = canvasRef.current;
          const cctx = canvas.getContext("2d");

          const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
          const sampleAvgColor = (cx, cy) => {
            let r = 0,
              g = 0,
              b = 0,
              a = 0,
              n = 0;
            for (let i = 0; i < picks; i++) {
              const ang = Math.random() * Math.PI * 2;
              const dist = Math.random() * sampleRadius;
              const sx = clamp(
                Math.floor(cx + Math.cos(ang) * dist),
                0,
                canvas.width - 1
              );
              const sy = clamp(
                Math.floor(cy + Math.sin(ang) * dist),
                0,
                canvas.height - 1
              );
              try {
                const data = cctx.getImageData(sx, sy, 1, 1).data;
                r += data[0];
                g += data[1];
                b += data[2];
                a += data[3];
                n++;
              } catch {
                // ignore cross-origin or out-of-bounds
              }
            }
            if (n === 0) return `rgba(0,0,0,0)`;
            r = Math.round(r / n);
            g = Math.round(g / n);
            b = Math.round(b / n);
            const alphaF = a / n / 255;
            return `rgba(${r},${g},${b},${alphaF.toFixed(3)})`;
          };

          // draw a few soft stamps along the current segment near endPos
          const stamps = 4;
          for (let i = 0; i < stamps; i++) {
            const t = (i + 1) / (stamps + 1);
            const sx = startPos.x + (endPos.x - startPos.x) * t;
            const sy = startPos.y + (endPos.y - startPos.y) * t;
            const col = sampleAvgColor(sx, sy);
            ctx.save();
            ctx.globalAlpha =
              (BRUSH_CONFIG.crayon.smudge.alpha ?? 0.25) * alpha;
            ctx.shadowBlur = blurPx;
            ctx.shadowColor = col;
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(1, brushSize * 0.35), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        break;
      }
      case "droplet": {
        // Draw a central droplet at current position with splash particles
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineCap = BRUSH_CONFIG.droplet.lineCap;
        ctx.lineJoin = BRUSH_CONFIG.droplet.lineJoin;

        const baseRadius = Math.max(
          1,
          brushSize * (BRUSH_CONFIG.droplet.radiusScale ?? 0.8)
        );
        const cx = endPos.x;
        const cy = endPos.y;

        // Central blob
        ctx.globalAlpha = alpha * (BRUSH_CONFIG.droplet.alphaMultiplier ?? 1.0);
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
        ctx.fill();

        // Splash droplets
        const count = BRUSH_CONFIG.droplet.splashCount ?? 6;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distMul =
            (BRUSH_CONFIG.droplet.splashDistanceMin ?? 0.8) +
            Math.random() *
              ((BRUSH_CONFIG.droplet.splashDistanceMax ?? 2.0) -
                (BRUSH_CONFIG.droplet.splashDistanceMin ?? 0.8));
          const dx = Math.cos(angle) * baseRadius * distMul;
          const dy = Math.sin(angle) * baseRadius * distMul;
          const rMul =
            (BRUSH_CONFIG.droplet.splashRadiusScaleMin ?? 0.15) +
            Math.random() *
              ((BRUSH_CONFIG.droplet.splashRadiusScaleMax ?? 0.35) -
                (BRUSH_CONFIG.droplet.splashRadiusScaleMin ?? 0.15));
          const r = Math.max(0.5, baseRadius * rMul);
          ctx.globalAlpha = alpha * (BRUSH_CONFIG.droplet.splashAlpha ?? 0.6);
          ctx.beginPath();
          ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "pencil":
        // Pencil: Sharp, precise strokes with slight texture
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.lineCap = "square";
        ctx.lineJoin = "miter";
        ctx.lineWidth = brushSize;
        ctx.globalAlpha = alpha;

        // Draw main stroke
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();

        // Add subtle graphite texture even at small sizes
        {
          const textureLineWidth = Math.max(0.5, brushSize * 0.3);
          const offsetRange = Math.max(0.4, brushSize * 0.4);
          ctx.lineWidth = textureLineWidth;
          ctx.globalAlpha = alpha * 0.35;
          // Lightly dashed micro-lines for graphite feel at tiny sizes
          if (ctx.setLineDash)
            ctx.setLineDash([
              Math.max(1, brushSize),
              Math.max(2, brushSize * 1.2),
            ]);
          for (let i = 0; i < 2; i++) {
            const offset = (Math.random() - 0.5) * offsetRange;
            ctx.beginPath();
            ctx.moveTo(startPos.x + offset, startPos.y + offset);
            ctx.lineTo(endPos.x + offset, endPos.y + offset);
            ctx.stroke();
          }
          if (ctx.setLineDash) ctx.setLineDash([]);
        }
        break;

      case "marker":
        // Marker: Multiple stroke styles to mimic real marker techniques
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Soft bleed underlay to keep distinct at small sizes
        ctx.lineWidth = Math.max(1, brushSize * 1.6);
        ctx.globalAlpha = alpha * 0.25;
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();

        // Style 1: Main marker stroke
        ctx.lineWidth = brushSize;
        ctx.globalAlpha = alpha * 0.9;
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();

        // Style 2: Cross-hatching effect (diagonal strokes)
        if (brushSize > 3) {
          ctx.lineWidth = brushSize * 0.4;
          ctx.globalAlpha = alpha * 0.5;

          // Diagonal cross-hatching
          const diagonalOffset = brushSize * 0.6;
          for (let i = 0; i < 2; i++) {
            const angle = (i * Math.PI) / 4; // 45° and 135° angles
            const offsetX = Math.cos(angle) * diagonalOffset;
            const offsetY = Math.sin(angle) * diagonalOffset;

            ctx.beginPath();
            ctx.moveTo(startPos.x + offsetX, startPos.y + offsetY);
            ctx.lineTo(endPos.x + offsetX, endPos.y + offsetY);
            ctx.stroke();
          }
        }

        // Style 3: Stippling effect (dots)
        if (brushSize > 1) {
          ctx.lineWidth = 1;
          ctx.globalAlpha = alpha * 0.7;

          const dotCount = Math.max(3, Math.floor(brushSize / 2));
          for (let i = 0; i < dotCount; i++) {
            const t = i / (dotCount - 1);
            const x = startPos.x + (endPos.x - startPos.x) * t;
            const y = startPos.y + (endPos.y - startPos.y) * t;

            // Random offset for natural stippling
            const offsetX =
              (Math.random() - 0.5) * Math.max(0.8, brushSize * 0.8);
            const offsetY =
              (Math.random() - 0.5) * Math.max(0.8, brushSize * 0.8);

            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, 1, 0, 2 * Math.PI);
            ctx.fill();
          }
        }

        // Style 4: Pressure variation (thicker center, thinner edges)
        if (brushSize > 4) {
          ctx.lineWidth = brushSize * 0.8;
          ctx.globalAlpha = alpha * 0.6;
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(endPos.x, endPos.y);
          ctx.stroke();

          // Thin edge strokes
          ctx.lineWidth = brushSize * 0.3;
          ctx.globalAlpha = alpha * 0.4;
          for (let i = 0; i < 2; i++) {
            const offset = (i === 0 ? -1 : 1) * brushSize * 0.4;
            ctx.beginPath();
            ctx.moveTo(startPos.x + offset, startPos.y + offset);
            ctx.lineTo(endPos.x + offset, endPos.y + offset);
            ctx.stroke();
          }
        }
        break;

      case "fine":
        // Fine brush: Precise, thin strokes for detail work
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(0.5, brushSize * 0.5);
        ctx.globalAlpha = alpha;

        // Draw precise stroke
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();
        break;

      default: {
        // normal brush with watercolor effect
        // Normal brush: Now includes watercolor effect for natural blending
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = brushSize;
        // Fixed 50% opacity for normal brush main stroke
        ctx.globalAlpha = 0.5;

        // Soft edge underlay (lighter than marker) for distinction at small sizes
        ctx.save();
        ctx.lineWidth = Math.max(1, brushSize * 1.3);
        // Underlay scaled from the fixed 50% base
        ctx.globalAlpha = 0.5 * 0.15;
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();
        ctx.restore();

        // Draw main stroke
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();

        // Add watercolor effect with multiple overlapping strokes
        const watercolorStrokes = Math.max(2, Math.floor(brushSize / 3));
        for (let i = 0; i < watercolorStrokes; i++) {
          const offsetX = (Math.random() - 0.5) * brushSize * 0.8;
          const offsetY = (Math.random() - 0.5) * brushSize * 0.8;
          const strokeWidth = brushSize * (0.3 + Math.random() * 0.7);

          ctx.lineWidth = strokeWidth;
          // Watercolor overlays scaled from the fixed 50% base
          ctx.globalAlpha = 0.5 * (0.2 + Math.random() * 0.4);

          ctx.beginPath();
          ctx.moveTo(startPos.x + offsetX, startPos.y + offsetY);
          ctx.lineTo(endPos.x + offsetX, endPos.y + offsetY);
          ctx.stroke();
        }
        break;
      }
    }
  };

  // New drawing functions for shapes and lines
  const drawLine = (start, end, ctx = null) => {
    const context = ctx || canvasRef.current.getContext("2d");

    context.globalCompositeOperation = "source-over";
    context.strokeStyle = color;
    context.globalAlpha = opacity / 100;
    context.lineWidth = brushSize;
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  };

  const drawRectangle = (start, end, ctx = null) => {
    const context = ctx || canvasRef.current.getContext("2d");

    const width = end.x - start.x;
    const height = end.y - start.y;

    context.globalCompositeOperation = "source-over";
    context.strokeStyle = color;
    context.fillStyle = color;
    context.globalAlpha = opacity / 100;
    context.lineWidth = brushSize;

    context.beginPath();
    context.rect(start.x, start.y, width, height);
    if (fillShapes) {
      context.fill();
    }
    context.stroke();
  };

  const drawCircle = (start, end, ctx = null) => {
    const context = ctx || canvasRef.current.getContext("2d");

    const radius = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );

    context.globalCompositeOperation = "source-over";
    context.strokeStyle = color;
    context.fillStyle = color;
    context.globalAlpha = opacity / 100;
    context.lineWidth = brushSize;

    context.beginPath();
    context.arc(start.x, start.y, radius, 0, 2 * Math.PI);
    if (fillShapes) {
      context.fill();
    }
    context.stroke();
  };

  // Additional shape drawing functions
  const drawTriangle = (start, end, ctx = null) => {
    const context = ctx || canvasRef.current.getContext("2d");

    const width = end.x - start.x;
    const height = end.y - start.y;

    context.globalCompositeOperation = "source-over";
    context.strokeStyle = color;
    context.fillStyle = color;
    context.globalAlpha = opacity / 100;
    context.lineWidth = brushSize;

    context.beginPath();
    context.moveTo(start.x + width / 2, start.y);
    context.lineTo(start.x, start.y + height);
    context.lineTo(start.x + width, start.y + height);
    context.closePath();

    if (fillShapes) {
      context.fill();
    }
    context.stroke();
  };

  const drawStar = (start, end, ctx = null) => {
    const context = ctx || canvasRef.current.getContext("2d");

    const width = end.x - start.x;
    const height = end.y - start.y;
    const centerX = start.x + width / 2;
    const centerY = start.y + height / 2;
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius * 0.4;
    const spikes = 5;

    context.globalCompositeOperation = "source-over";
    context.strokeStyle = color;
    context.fillStyle = color;
    context.globalAlpha = opacity / 100;
    context.lineWidth = brushSize;

    context.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.closePath();

    if (fillShapes) {
      context.fill();
    }
    context.stroke();
  };

  const drawDiamond = (start, end, ctx = null) => {
    const context = ctx || canvasRef.current.getContext("2d");

    const width = end.x - start.x;
    const height = end.y - start.y;
    const centerX = start.x + width / 2;
    const centerY = start.y + height / 2;

    context.globalCompositeOperation = "source-over";
    context.strokeStyle = color;
    context.fillStyle = color;
    context.globalAlpha = opacity / 100;
    context.lineWidth = brushSize;

    context.beginPath();
    context.moveTo(centerX, start.y);
    context.lineTo(end.x, centerY);
    context.lineTo(centerX, end.y);
    context.lineTo(start.x, centerY);
    context.closePath();

    if (fillShapes) {
      context.fill();
    }
    context.stroke();
  };

  const drawHexagon = (start, end, ctx = null) => {
    const context = ctx || canvasRef.current.getContext("2d");

    const width = end.x - start.x;
    const height = end.y - start.y;
    const centerX = start.x + width / 2;
    const centerY = start.y + height / 2;
    const radius = Math.min(width, height) / 2;

    context.globalCompositeOperation = "source-over";
    context.strokeStyle = color;
    context.fillStyle = color;
    context.globalAlpha = opacity / 100;
    context.lineWidth = brushSize;

    context.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.closePath();

    if (fillShapes) {
      context.fill();
    }
    context.stroke();
  };

  const drawEllipse = (start, end, ctx = null) => {
    const context = ctx || canvasRef.current.getContext("2d");

    const width = end.x - start.x;
    const height = end.y - start.y;
    const centerX = start.x + width / 2;
    const centerY = start.y + height / 2;
    const radiusX = Math.abs(width) / 2;
    const radiusY = Math.abs(height) / 2;

    context.globalCompositeOperation = "source-over";
    context.strokeStyle = color;
    context.fillStyle = color;
    context.globalAlpha = opacity / 100;
    context.lineWidth = brushSize;

    context.beginPath();
    context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

    if (fillShapes) {
      context.fill();
    }
    context.stroke();
  };

  const drawPentagon = (start, end, ctx = null) => {
    const context = ctx || canvasRef.current.getContext("2d");

    const width = end.x - start.x;
    const height = end.y - start.y;
    const centerX = start.x + width / 2;
    const centerY = start.y + height / 2;
    const radius = Math.min(width, height) / 2;

    context.globalCompositeOperation = "source-over";
    context.strokeStyle = color;
    context.fillStyle = color;
    context.globalAlpha = opacity / 100;
    context.lineWidth = brushSize;

    context.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.closePath();

    if (fillShapes) {
      context.fill();
    }
    context.stroke();
  };

  // Shape management functions
  const addShape = (shapeData) => {
    const newShape = {
      id: Date.now() + Math.random(),
      ...shapeData,
      selected: false,
    };
    setShapes((prev) => [...prev, newShape]);
    return newShape;
  };

  const selectShape = (shapeId) => {
    setShapes((prev) =>
      prev.map((shape) => ({
        ...shape,
        selected: shape.id === shapeId,
      }))
    );
    setSelectedShape(shapeId);
  };

  const clearSelection = () => {
    setShapes((prev) => prev.map((shape) => ({ ...shape, selected: false })));
    setSelectedShape(null);
    setIsDragging(false);
    setIsResizing(false);
    setHoveredHandle(null); // Clear hovered handle when clearing selection
  };

  const isPointInShape = (point, shape) => {
    switch (shape.type) {
      case "rectangle":
        return (
          point.x >= shape.x &&
          point.x <= shape.x + shape.width &&
          point.y >= shape.y &&
          point.y <= shape.y + shape.height
        );
      case "circle": {
        const distance = Math.sqrt(
          Math.pow(point.x - shape.x, 2) + Math.pow(point.y - shape.y, 2)
        );
        return distance <= shape.radius;
      }
      case "line": {
        const tolerance = 5;
        const A = point.x - shape.startX;
        const B = point.y - shape.startY;
        const C = shape.endX - shape.startX;
        const D = shape.endY - shape.startY;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        let xx, yy;
        if (param < 0) {
          xx = shape.startX;
          yy = shape.startY;
        } else if (param > 1) {
          xx = shape.endX;
          yy = shape.endY;
        } else {
          xx = shape.startX + param * C;
          yy = shape.startY + param * D;
        }
        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy) <= tolerance;
      }
      case "triangle": {
        // Check if point is inside triangle using barycentric coordinates
        const topX = shape.x + shape.width / 2;
        const topY = shape.y;
        const leftX = shape.x;
        const leftY = shape.y + shape.height;
        const rightX = shape.x + shape.width;
        const rightY = shape.y + shape.height;

        // Barycentric coordinates calculation
        const v0x = leftX - topX;
        const v0y = leftY - topY;
        const v1x = rightX - topX;
        const v1y = rightY - topY;
        const v2x = point.x - topX;
        const v2y = point.y - topY;

        const dot00 = v0x * v0x + v0y * v0y;
        const dot01 = v0x * v1x + v0y * v1y;
        const dot02 = v0x * v2x + v0y * v2y;
        const dot11 = v1x * v1x + v1y * v1y;
        const dot12 = v1x * v2x + v1y * v2y;

        const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

        return u >= 0 && v >= 0 && u + v <= 1;
      }
      case "star": {
        // Approximate star as a circle for click detection
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const radius = Math.min(shape.width, shape.height) / 2;
        const distance = Math.sqrt(
          Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
        );
        return distance <= radius;
      }
      case "diamond": {
        // Check if point is inside diamond
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const halfWidth = shape.width / 2;
        const halfHeight = shape.height / 2;

        const dx = Math.abs(point.x - centerX);
        const dy = Math.abs(point.y - centerY);

        return dx / halfWidth + dy / halfHeight <= 1;
      }
      case "hexagon": {
        // Check if point is inside hexagon
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const radius = Math.min(shape.width, shape.height) / 2;

        const distance = Math.sqrt(
          Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
        );
        return distance <= radius;
      }
      case "ellipse": {
        // Check if point is inside ellipse
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const radiusX = shape.width / 2;
        const radiusY = shape.height / 2;

        const dx = (point.x - centerX) / radiusX;
        const dy = (point.y - centerY) / radiusY;

        return dx * dx + dy * dy <= 1;
      }
      case "pentagon": {
        // Check if point is inside pentagon (approximate as circle)
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const radius = Math.min(shape.width, shape.height) / 2;
        const distance = Math.sqrt(
          Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
        );
        return distance <= radius;
      }
      default:
        return false;
    }
  };

  const getResizeHandle = (point, shape) => {
    const handleSize = 10; // Increased handle size for better usability
    const handles = getShapeHandles(shape);

    for (let handle of handles) {
      if (
        Math.abs(point.x - handle.x) <= handleSize &&
        Math.abs(point.y - handle.y) <= handleSize
      ) {
        return handle.type;
      }
    }
    return null;
  };

  // Show size indicator during resize operations
  const showSizeIndicator = (shape, pos, resizeHandle) => {
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;

    const ctx = previewCanvas.getContext("2d");
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    // Calculate new dimensions based on resize handle
    let newWidth, newHeight, newX, newY;
    const minSize = 10;

    // Handle different shape types and resize handles
    if (shape.type === "triangle") {
      switch (resizeHandle) {
        case "nw":
          newWidth = Math.max(shape.x + shape.width - pos.x, minSize);
          newHeight = Math.max(shape.y + shape.height - pos.y, minSize);
          newX = pos.x;
          newY = pos.y;
          break;
        case "ne":
          newWidth = Math.max(pos.x - shape.x, minSize);
          newHeight = Math.max(shape.y + shape.height - pos.y, minSize);
          newX = shape.x;
          newY = pos.y;
          break;
        case "s":
          newWidth = shape.width;
          newHeight = Math.max(pos.y - shape.y, minSize);
          newX = shape.x;
          newY = shape.y;
          break;
        default:
          return;
      }
    } else if (shape.type === "diamond") {
      switch (resizeHandle) {
        case "n":
          newWidth = shape.width;
          newHeight = Math.max(shape.y + shape.height - pos.y, minSize);
          newX = shape.x;
          newY = pos.y;
          break;
        case "e":
          newWidth = Math.max(pos.x - shape.x, minSize);
          newHeight = shape.height;
          newX = shape.x;
          newY = shape.y;
          break;
        case "s":
          newWidth = shape.width;
          newHeight = Math.max(pos.y - shape.y, minSize);
          newX = shape.x;
          newY = shape.y;
          break;
        case "w":
          newWidth = Math.max(shape.x + shape.width - pos.x, minSize);
          newHeight = shape.height;
          newX = pos.x;
          newY = shape.y;
          break;
        default:
          return;
      }
    } else if (shape.type === "star") {
      // Star resizing with edge-based handles
      switch (resizeHandle) {
        case "n":
          newWidth = shape.width;
          newHeight = Math.max(shape.y + shape.height - pos.y, minSize);
          newX = shape.x;
          newY = pos.y;
          break;
        case "e":
          newWidth = Math.max(pos.x - shape.x, minSize);
          newHeight = shape.height;
          newX = shape.x;
          newY = shape.y;
          break;
        case "s":
          newWidth = shape.width;
          newHeight = Math.max(pos.y - shape.y, minSize);
          newX = shape.x;
          newY = shape.y;
          break;
        case "w":
          newWidth = Math.max(shape.x + shape.width - pos.x, minSize);
          newHeight = shape.height;
          newX = pos.x;
          newY = shape.y;
          break;
        default:
          return;
      }
    } else if (shape.type === "hexagon") {
      // Hexagon resizing with vertex-based handles
      switch (resizeHandle) {
        case "n":
          newWidth = shape.width;
          newHeight = Math.max(shape.y + shape.height - pos.y, minSize);
          newX = shape.x;
          newY = pos.y;
          break;
        case "ne":
          newWidth = Math.max(pos.x - shape.x, minSize);
          newHeight = Math.max(shape.y + shape.height - pos.y, minSize);
          newX = shape.x;
          newY = pos.y;
          break;
        case "se":
          newWidth = Math.max(pos.x - shape.x, minSize);
          newHeight = Math.max(pos.y - shape.y, minSize);
          newX = shape.x;
          newY = shape.y;
          break;
        case "s":
          newWidth = shape.width;
          newHeight = Math.max(pos.y - shape.y, minSize);
          newX = shape.x;
          newY = shape.y;
          break;
        case "sw":
          newWidth = Math.max(shape.x + shape.width - pos.x, minSize);
          newHeight = Math.max(pos.y - shape.y, minSize);
          newX = pos.x;
          newY = pos.y;
          break;
        case "nw":
          newWidth = Math.max(shape.x + shape.width - pos.x, minSize);
          newHeight = Math.max(shape.y + shape.height - pos.y, minSize);
          newX = pos.x;
          newY = pos.y;
          break;
        default:
          return;
      }
    } else if (shape.type === "ellipse") {
      // Ellipse resizing with edge-based handles
      switch (resizeHandle) {
        case "n":
          newWidth = shape.width;
          newHeight = Math.max(shape.y + shape.height - pos.y, minSize);
          newX = shape.x;
          newY = pos.y;
          break;
        case "e":
          newWidth = Math.max(pos.x - shape.x, minSize);
          newHeight = shape.height;
          newX = shape.x;
          newY = shape.y;
          break;
        case "s":
          newWidth = shape.width;
          newHeight = Math.max(pos.y - shape.y, minSize);
          newX = shape.x;
          newY = shape.y;
          break;
        case "w":
          newWidth = Math.max(shape.x + shape.width - pos.x, minSize);
          newHeight = shape.height;
          newX = pos.x;
          newY = shape.y;
          break;
        default:
          return;
      }
    } else if (shape.type === "pentagon") {
      // Pentagon resizing with vertex-based handles
      switch (resizeHandle) {
        case "n":
          newWidth = shape.width;
          newHeight = Math.max(shape.y + shape.height - pos.y, minSize);
          newX = shape.x;
          newY = pos.y;
          break;
        case "ne":
          newWidth = Math.max(pos.x - shape.x, minSize);
          newHeight = Math.max(shape.y + shape.height - pos.y, minSize);
          newX = shape.x;
          newY = pos.y;
          break;
        case "se":
          newWidth = Math.max(pos.x - shape.x, minSize);
          newHeight = Math.max(pos.y - shape.y, minSize);
          newX = shape.x;
          newY = shape.y;
          break;
        case "sw":
          newWidth = Math.max(shape.x + shape.width - pos.x, minSize);
          newHeight = Math.max(pos.y - shape.y, minSize);
          newX = pos.x;
          newY = pos.y;
          break;
        case "nw":
          newWidth = Math.max(shape.x + shape.width - pos.x, minSize);
          newHeight = Math.max(shape.y + shape.height - pos.y, minSize);
          newX = pos.x;
          newY = pos.y;
          break;
        default:
          return;
      }
    } else {
      // Standard corner-based resizing for other shapes
      switch (resizeHandle) {
        case "se":
          newWidth = Math.max(pos.x - shape.x, minSize);
          newHeight = Math.max(pos.y - shape.y, minSize);
          newX = shape.x;
          newY = shape.y;
          break;
        case "sw":
          newWidth = Math.max(shape.x + shape.width - pos.x, minSize);
          newHeight = Math.max(pos.y - shape.y, minSize);
          newX = pos.x;
          newY = shape.y;
          break;
        case "ne":
          newWidth = Math.max(pos.x - shape.x, minSize);
          newHeight = Math.max(shape.y + shape.height - pos.y, minSize);
          newX = shape.x;
          newY = pos.y;
          break;
        case "nw":
          newWidth = Math.max(shape.x + shape.width - pos.x, minSize);
          newHeight = Math.max(shape.y + shape.height - pos.y, minSize);
          newX = pos.x;
          newY = pos.y;
          break;
        default:
          return;
      }
    }

    // Draw size indicator
    ctx.strokeStyle = "#0066FF";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(newX, newY, newWidth, newHeight);

    // Draw size text
    ctx.setLineDash([]);
    ctx.fillStyle = "#0066FF";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `${Math.round(newWidth)} × ${Math.round(newHeight)}`,
      newX + newWidth / 2,
      newY - 10
    );
  };

  const getShapeHandles = (shape) => {
    switch (shape.type) {
      case "rectangle":
        return [
          { type: "nw", x: shape.x, y: shape.y },
          { type: "ne", x: shape.x + shape.width, y: shape.y },
          { type: "sw", x: shape.x, y: shape.y + shape.height },
          { type: "se", x: shape.x + shape.width, y: shape.y + shape.height },
        ];
      case "circle":
        // Circle handles positioned on the actual circle boundary
        return [
          { type: "n", x: shape.x, y: shape.y - shape.radius },
          { type: "s", x: shape.x, y: shape.y + shape.radius },
          { type: "e", x: shape.x + shape.radius, y: shape.y },
          { type: "w", x: shape.x - shape.radius, y: shape.y },
        ];
      case "triangle": {
        // Triangle handles positioned on the actual triangle vertices
        const triCenterX = shape.x + shape.width / 2;
        const triTopY = shape.y;
        const triLeftY = shape.y + shape.height;
        const triRightY = shape.y + shape.height;
        return [
          { type: "nw", x: shape.x, y: triLeftY },
          { type: "ne", x: shape.x + shape.width, y: triRightY },
          { type: "s", x: triCenterX, y: triTopY },
        ];
      }
      case "diamond": {
        // Diamond handles positioned on the actual diamond vertices
        const diamondCenterX = shape.x + shape.width / 2;
        const diamondCenterY = shape.y + shape.height / 2;
        return [
          { type: "n", x: diamondCenterX, y: shape.y },
          { type: "e", x: shape.x + shape.width, y: diamondCenterY },
          { type: "s", x: diamondCenterX, y: shape.y + shape.height },
          { type: "w", x: shape.x, y: diamondCenterY },
        ];
      }
      case "star": {
        // Star handles positioned on the actual star points
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const radius = Math.min(shape.width, shape.height) / 2;

        return [
          { type: "n", x: centerX, y: centerY - radius },
          { type: "e", x: centerX + radius, y: centerY },
          { type: "s", x: centerX, y: centerY + radius },
          { type: "w", x: centerX - radius, y: centerY },
        ];
      }
      case "hexagon": {
        // Hexagon handles positioned on the actual hexagon vertices
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const radius = Math.min(shape.width, shape.height) / 2;

        return [
          { type: "n", x: centerX, y: centerY - radius },
          {
            type: "ne",
            x: centerX + radius * Math.cos(Math.PI / 6),
            y: centerY - radius * Math.sin(Math.PI / 6),
          },
          {
            type: "se",
            x: centerX + radius * Math.cos(Math.PI / 6),
            y: centerY + radius * Math.sin(Math.PI / 6),
          },
          { type: "s", x: centerX, y: centerY + radius },
          {
            type: "sw",
            x: centerX - radius * Math.cos(Math.PI / 6),
            y: centerY + radius * Math.sin(Math.PI / 6),
          },
          {
            type: "nw",
            x: centerX - radius * Math.cos(Math.PI / 6),
            y: centerY - radius * Math.sin(Math.PI / 6),
          },
        ];
      }
      case "ellipse": {
        // Ellipse handles positioned on the actual ellipse boundary
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const radiusX = shape.width / 2;
        const radiusY = shape.height / 2;

        return [
          { type: "n", x: centerX, y: centerY - radiusY },
          { type: "e", x: centerX + radiusX, y: centerY },
          { type: "s", x: centerX, y: centerY + radiusY },
          { type: "w", x: centerX - radiusX, y: centerY },
        ];
      }
      case "pentagon": {
        // Pentagon handles positioned on the actual pentagon vertices
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const radius = Math.min(shape.width, shape.height) / 2;

        return [
          { type: "n", x: centerX, y: centerY - radius },
          {
            type: "ne",
            x: centerX + radius * Math.cos(Math.PI / 5),
            y: centerY - radius * Math.sin(Math.PI / 5),
          },
          {
            type: "se",
            x: centerX + radius * Math.cos(Math.PI / 5),
            y: centerY + radius * Math.sin(Math.PI / 5),
          },
          {
            type: "sw",
            x: centerX - radius * Math.cos(Math.PI / 5),
            y: centerY + radius * Math.sin(Math.PI / 5),
          },
          {
            type: "nw",
            x: centerX - radius * Math.cos(Math.PI / 5),
            y: centerY - radius * Math.sin(Math.PI / 5),
          },
        ];
      }
      default:
        return [];
    }
  };

  const addText = (text, position) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity / 100;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";

    ctx.fillText(text, position.x, position.y);
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      addText(textInput.trim(), textPosition);
      setTextInput("");
      setShowTextModal(false);
      saveToHistory();
      onDirtyChange(true); // Mark as dirty after adding text
    }
  };

  const handleTextCancel = () => {
    setTextInput("");
    setShowTextModal(false);
  };

  const startDrawing = (e) => {
    const pos = getMousePos(e);

    if (tool === "text") {
      setTextPosition(pos);
      setShowTextModal(true);
      return;
    }

    if (tool === "select") {
      // Check if clicking on a shape
      const clickedShape = shapes.find((shape) => isPointInShape(pos, shape));
      if (clickedShape) {
        selectShape(clickedShape.id);

        // Check if clicking on resize handle
        const handle = getResizeHandle(pos, clickedShape);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          setDragOffset({
            x: pos.x - clickedShape.x,
            y: pos.y - clickedShape.y,
          });
          // Store original shapes state before transformation
          setOriginalShapes([...shapes]);
        } else {
          // Start dragging
          setIsDragging(true);
          setDragOffset({
            x: pos.x - clickedShape.x,
            y: pos.y - clickedShape.y,
          });
          // Store original shapes state before transformation
          setOriginalShapes([...shapes]);
        }
      } else {
        clearSelection();
      }
      return;
    }

    if (tool === "brush" || tool === "eraser") {
      setIsDrawing(true);
      setLastDrawPos(pos);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (tool === "eraser") {
        applyBrushSettings(ctx);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      } else {
        // For brush tools, we'll start drawing in the draw function
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }
    } else if (
      tool === "line" ||
      tool === "rectangle" ||
      tool === "circle" ||
      tool === "triangle" ||
      tool === "ellipse" ||
      tool === "star" ||
      tool === "diamond" ||
      tool === "hexagon" ||
      tool === "pentagon"
    ) {
      setStartPoint(pos);
      setIsDrawingShape(true);
    }
  };

  // Update cursor based on hover position for better UX
  const updateCursor = (pos) => {
    if (tool !== "select") {
      setHoveredHandle(null); // Clear hovered handle when not using select tool
      return;
    }

    const selectedShape = shapes.find((s) => s.selected);
    if (!selectedShape) return;

    const handle = getResizeHandle(pos, selectedShape);
    if (handle) {
      // Update hovered handle state for visual feedback
      setHoveredHandle(handle);

      // Update cursor based on resize handle type and shape
      const canvas = canvasRef.current;
      if (canvas) {
        if (selectedShape.type === "triangle") {
          switch (handle) {
            case "nw":
            case "ne":
              canvas.style.cursor = "nesw-resize";
              break;
            case "s":
              canvas.style.cursor = "ns-resize";
              break;
            default:
              canvas.style.cursor = "default";
          }
        } else if (selectedShape.type === "diamond") {
          switch (handle) {
            case "n":
            case "s":
              canvas.style.cursor = "ns-resize";
              break;
            case "e":
            case "w":
              canvas.style.cursor = "ew-resize";
              break;
            default:
              canvas.style.cursor = "default";
          }
        } else if (selectedShape.type === "star") {
          // Star cursor handling
          switch (handle) {
            case "n":
            case "s":
              canvas.style.cursor = "ns-resize";
              break;
            case "e":
            case "w":
              canvas.style.cursor = "ew-resize";
              break;
            default:
              canvas.style.cursor = "default";
          }
        } else if (selectedShape.type === "hexagon") {
          // Hexagon cursor handling
          switch (handle) {
            case "n":
            case "s":
              canvas.style.cursor = "ns-resize";
              break;
            case "e":
            case "w":
              canvas.style.cursor = "ew-resize";
              break;
            case "ne":
            case "sw":
              canvas.style.cursor = "nesw-resize";
              break;
            case "nw":
            case "se":
              canvas.style.cursor = "nwse-resize";
              break;
            default:
              canvas.style.cursor = "default";
          }
        } else if (selectedShape.type === "ellipse") {
          // Ellipse cursor handling
          switch (handle) {
            case "n":
            case "s":
              canvas.style.cursor = "ns-resize";
              break;
            case "e":
            case "w":
              canvas.style.cursor = "ew-resize";
              break;
            default:
              canvas.style.cursor = "default";
          }
        } else if (selectedShape.type === "pentagon") {
          // Pentagon cursor handling
          switch (handle) {
            case "n":
            case "s":
              canvas.style.cursor = "ns-resize";
              break;
            case "e":
            case "w":
              canvas.style.cursor = "ew-resize";
              break;
            case "ne":
            case "sw":
              canvas.style.cursor = "nesw-resize";
              break;
            case "nw":
            case "se":
              canvas.style.cursor = "nwse-resize";
              break;
            default:
              canvas.style.cursor = "default";
          }
        } else {
          // Standard cursor handling for other shapes
          switch (handle) {
            case "nw":
            case "se":
              canvas.style.cursor = "nwse-resize";
              break;
            case "ne":
            case "sw":
              canvas.style.cursor = "nesw-resize";
              break;
            default:
              canvas.style.cursor = "default";
          }
        }
      }
    } else if (isPointInShape(pos, selectedShape)) {
      // Clear hovered handle when hovering over shape body
      setHoveredHandle(null);

      // Show move cursor when hovering over shape
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = "move";
      }
    } else {
      // Clear hovered handle when not hovering over anything
      setHoveredHandle(null);

      // Reset cursor
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = "default";
      }
    }
  };

  const draw = (e) => {
    if (!isDrawing && !isDrawingShape && !isDragging && !isResizing) return;

    const pos = getMousePos(e);

    // Update cursor for better UX
    updateCursor(pos);

    if (tool === "select" && (isDragging || isResizing)) {
      const shape = shapes.find((s) => s.selected);
      if (shape) {
        if (isDragging) {
          // Move shape
          const newShapes = shapes.map((s) =>
            s.id === shape.id
              ? { ...s, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }
              : s
          );
          setShapes(newShapes);
          // Don't save transformation here - will save on mouse up
        } else if (isResizing) {
          // Resize shape with real-time preview
          const newShapes = shapes.map((s) => {
            if (s.id !== shape.id) return s;

            switch (s.type) {
              case "rectangle": {
                if (resizeHandle === "se") {
                  return { ...s, width: pos.x - s.x, height: pos.y - s.y };
                } else if (resizeHandle === "sw") {
                  return {
                    ...s,
                    x: pos.x,
                    width: s.x + s.width - pos.x,
                    height: pos.y - s.y,
                  };
                } else if (resizeHandle === "ne") {
                  return {
                    ...s,
                    y: pos.y,
                    width: pos.x - s.x,
                    height: s.y + s.height - pos.y,
                  };
                } else if (resizeHandle === "nw") {
                  return {
                    ...s,
                    x: pos.x,
                    y: pos.y,
                    width: s.x + s.width - pos.x,
                    height: s.y + s.height - pos.y,
                  };
                }
                break;
              }
              case "circle": {
                const radius = Math.sqrt(
                  Math.pow(pos.x - s.x, 2) + Math.pow(pos.y - s.y, 2)
                );
                return { ...s, radius };
              }
              case "triangle": {
                // Triangle resizing with vertex-based handles
                const minSize = 10;
                if (resizeHandle === "nw") {
                  const newWidth = Math.max(s.x + s.width - pos.x, minSize);
                  const newHeight = Math.max(s.y + s.height - pos.y, minSize);
                  return {
                    ...s,
                    x: pos.x,
                    y: pos.y,
                    width: newWidth,
                    height: newHeight,
                  };
                } else if (resizeHandle === "ne") {
                  const newWidth = Math.max(pos.x - s.x, minSize);
                  const newHeight = Math.max(s.y + s.height - pos.y, minSize);
                  return { ...s, y: pos.y, width: newWidth, height: newHeight };
                } else if (resizeHandle === "s") {
                  // Resize from bottom center (top vertex)
                  const newHeight = Math.max(pos.y - s.y, minSize);
                  return { ...s, height: newHeight };
                }
                break;
              }
              case "diamond": {
                // Diamond resizing with vertex-based handles
                const minSize = 10;
                if (resizeHandle === "n") {
                  const newHeight = Math.max(s.y + s.height - pos.y, minSize);
                  return { ...s, y: pos.y, height: newHeight };
                } else if (resizeHandle === "e") {
                  const newWidth = Math.max(pos.x - s.x, minSize);
                  return { ...s, width: newWidth };
                } else if (resizeHandle === "s") {
                  const newHeight = Math.max(pos.y - s.y, minSize);
                  return { ...s, height: newHeight };
                } else if (resizeHandle === "w") {
                  const newWidth = Math.max(s.x + s.width - pos.x, minSize);
                  return { ...s, x: pos.x, width: newWidth };
                }
                break;
              }
              case "star": {
                // Star resizing with edge-based handles
                const minSize = 10;
                if (resizeHandle === "n") {
                  const newHeight = Math.max(s.y + s.height - pos.y, minSize);
                  return { ...s, y: pos.y, height: newHeight };
                } else if (resizeHandle === "e") {
                  const newWidth = Math.max(pos.x - s.x, minSize);
                  return { ...s, width: newWidth };
                } else if (resizeHandle === "s") {
                  const newHeight = Math.max(pos.y - s.y, minSize);
                  return { ...s, height: newHeight };
                } else if (resizeHandle === "w") {
                  const newWidth = Math.max(s.x + s.width - pos.x, minSize);
                  return { ...s, x: pos.x, width: newWidth };
                }
                break;
              }
              case "hexagon": {
                // Hexagon resizing with vertex-based handles
                const minSize = 10;
                if (resizeHandle === "n") {
                  const newHeight = Math.max(s.y + s.height - pos.y, minSize);
                  return { ...s, y: pos.y, height: newHeight };
                } else if (resizeHandle === "ne") {
                  const newWidth = Math.max(pos.x - s.x, minSize);
                  const newHeight = Math.max(s.y + s.height - pos.y, minSize);
                  return { ...s, y: pos.y, width: newWidth, height: newHeight };
                } else if (resizeHandle === "se") {
                  const newWidth = Math.max(pos.x - s.x, minSize);
                  const newHeight = Math.max(pos.y - s.y, minSize);
                  return { ...s, width: newWidth, height: newHeight };
                } else if (resizeHandle === "s") {
                  const newHeight = Math.max(pos.y - s.y, minSize);
                  return { ...s, height: newHeight };
                } else if (resizeHandle === "sw") {
                  const newWidth = Math.max(s.x + s.width - pos.x, minSize);
                  const newHeight = Math.max(pos.y - s.y, minSize);
                  return { ...s, x: pos.x, width: newWidth, height: newHeight };
                } else if (resizeHandle === "nw") {
                  const newWidth = Math.max(s.x + s.width - pos.x, minSize);
                  const newHeight = Math.max(s.y + s.height - pos.y, minSize);
                  return {
                    ...s,
                    x: pos.x,
                    y: pos.y,
                    width: newWidth,
                    height: newHeight,
                  };
                }
                break;
              }
              case "ellipse": {
                // Ellipse resizing with edge-based handles
                const minSize = 10;
                if (resizeHandle === "n") {
                  const newHeight = Math.max(s.y + s.height - pos.y, minSize);
                  return { ...s, y: pos.y, height: newHeight };
                } else if (resizeHandle === "e") {
                  const newWidth = Math.max(pos.x - s.x, minSize);
                  return { ...s, width: newWidth };
                } else if (resizeHandle === "s") {
                  const newHeight = Math.max(pos.y - s.y, minSize);
                  return { ...s, height: newHeight };
                } else if (resizeHandle === "w") {
                  const newWidth = Math.max(s.x + s.width - pos.x, minSize);
                  return { ...s, x: pos.x, width: newWidth };
                }
                break;
              }
              case "pentagon": {
                // Pentagon resizing with vertex-based handles
                const minSize = 10;
                if (resizeHandle === "n") {
                  const newHeight = Math.max(s.y + s.height - pos.y, minSize);
                  return { ...s, y: pos.y, height: newHeight };
                } else if (resizeHandle === "ne") {
                  const newWidth = Math.max(pos.x - s.x, minSize);
                  const newHeight = Math.max(s.y + s.height - pos.y, minSize);
                  return { ...s, y: pos.y, width: newWidth, height: newHeight };
                } else if (resizeHandle === "se") {
                  const newWidth = Math.max(pos.x - s.x, minSize);
                  const newHeight = Math.max(pos.y - s.y, minSize);
                  return { ...s, width: newWidth, height: newHeight };
                } else if (resizeHandle === "sw") {
                  const newWidth = Math.max(s.x + s.width - pos.x, minSize);
                  const newHeight = Math.max(pos.y - s.y, minSize);
                  return { ...s, x: pos.x, width: newWidth, height: newHeight };
                } else if (resizeHandle === "nw") {
                  const newWidth = Math.max(s.x + s.width - pos.x, minSize);
                  const newHeight = Math.max(s.y + s.height - pos.y, minSize);
                  return {
                    ...s,
                    x: pos.x,
                    y: pos.y,
                    width: newWidth,
                    height: newHeight,
                  };
                }
                break;
              }
            }
            return s;
          });
          setShapes(newShapes);

          // Show size indicator during resize
          showSizeIndicator(shape, pos, resizeHandle);

          // Don't save transformation here - will save on mouse up
        }
      }
      return;
    }

    if (tool === "brush" || tool === "eraser") {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (tool === "eraser") {
        // Handle eraser tool
        applyBrushSettings(ctx);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (lastDrawPos) {
        // Handle brush tools with enhanced stroke rendering
        // Draw from last position to current position for smooth strokes
        drawBrushStroke(
          ctx,
          lastDrawPos,
          pos,
          brushType,
          brushSize,
          opacity,
          color
        );
        setLastDrawPos(pos);
      }
    } else if (isDrawingShape && startPoint) {
      // Preview shape while dragging using preview canvas
      const previewCanvas = previewCanvasRef.current;
      const ctx = previewCanvas.getContext("2d");

      // Clear preview canvas
      ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

      // Draw preview on preview canvas
      const previewCtx = previewCanvas.getContext("2d");
      switch (tool) {
        case "line":
          drawLine(startPoint, pos, previewCtx);
          break;
        case "rectangle":
          drawRectangle(startPoint, pos, previewCtx);
          break;
        case "circle":
          drawCircle(startPoint, pos, previewCtx);
          break;
        case "triangle":
          drawTriangle(startPoint, pos, previewCtx);
          break;
        case "star":
          drawStar(startPoint, pos, previewCtx);
          break;
        case "diamond":
          drawDiamond(startPoint, pos, previewCtx);
          break;
        case "hexagon":
          drawHexagon(startPoint, pos, previewCtx);
          break;
        case "ellipse":
          drawEllipse(startPoint, pos, previewCtx);
          break;
        case "pentagon":
          drawPentagon(startPoint, pos, previewCtx);
          break;
      }
    }
  };

  const stopDrawing = (e) => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastDrawPos(null);
      saveToHistory();
      onDirtyChange(true); // Mark as dirty after drawing
    } else if (isDrawingShape && startPoint && e) {
      const pos = getMousePos(e);

      // Create shape data and add to shapes array
      let shapeData = null;
      switch (tool) {
        case "line":
          shapeData = {
            type: "line",
            startX: startPoint.x,
            startY: startPoint.y,
            endX: pos.x,
            endY: pos.y,
            color,
            opacity: opacity / 100,
            lineWidth: brushSize,
          };
          break;
        case "rectangle":
          shapeData = {
            type: "rectangle",
            x: Math.min(startPoint.x, pos.x),
            y: Math.min(startPoint.y, pos.y),
            width: Math.abs(pos.x - startPoint.x),
            height: Math.abs(pos.y - startPoint.y),
            color,
            opacity: opacity / 100,
            lineWidth: brushSize,
            filled: fillShapes,
          };
          break;
        case "circle": {
          const radius = Math.sqrt(
            Math.pow(pos.x - startPoint.x, 2) +
              Math.pow(pos.y - startPoint.y, 2)
          );
          shapeData = {
            type: "circle",
            x: startPoint.x,
            y: startPoint.y,
            radius,
            color,
            opacity: opacity / 100,
            lineWidth: brushSize,
            filled: fillShapes,
          };
          break;
        }
        case "triangle": {
          const width = Math.abs(pos.x - startPoint.x);
          const height = Math.abs(pos.y - startPoint.y);
          shapeData = {
            type: "triangle",
            x: Math.min(startPoint.x, pos.x),
            y: Math.min(startPoint.y, pos.y),
            width,
            height,
            color,
            opacity: opacity / 100,
            lineWidth: brushSize,
            filled: fillShapes,
          };
          break;
        }
        case "star": {
          const width = Math.abs(pos.x - startPoint.x);
          const height = Math.abs(pos.y - startPoint.y);
          shapeData = {
            type: "star",
            x: Math.min(startPoint.x, pos.x),
            y: Math.min(startPoint.y, pos.y),
            width,
            height,
            color,
            opacity: opacity / 100,
            lineWidth: brushSize,
            filled: fillShapes,
          };
          break;
        }
        case "diamond": {
          const width = Math.abs(pos.x - startPoint.x);
          const height = Math.abs(pos.y - startPoint.y);
          shapeData = {
            type: "diamond",
            x: Math.min(startPoint.x, pos.x),
            y: Math.min(startPoint.y, pos.y),
            width,
            height,
            color,
            opacity: opacity / 100,
            lineWidth: brushSize,
            filled: fillShapes,
          };
          break;
        }
        case "hexagon": {
          const width = Math.abs(pos.x - startPoint.x);
          const height = Math.abs(pos.y - startPoint.y);
          shapeData = {
            type: "hexagon",
            x: Math.min(startPoint.x, pos.x),
            y: Math.min(startPoint.y, pos.y),
            width,
            height,
            color,
            opacity: opacity / 100,
            lineWidth: brushSize,
            filled: fillShapes,
          };
          break;
        }
        case "ellipse": {
          const width = Math.abs(pos.x - startPoint.x);
          const height = Math.abs(pos.y - startPoint.y);
          shapeData = {
            type: "ellipse",
            x: Math.min(startPoint.x, pos.x),
            y: Math.min(startPoint.y, pos.y),
            width,
            height,
            color,
            opacity: opacity / 100,
            lineWidth: brushSize,
            filled: fillShapes,
          };
          break;
        }
        case "pentagon": {
          const width = Math.abs(pos.x - startPoint.x);
          const height = Math.abs(pos.y - startPoint.y);
          shapeData = {
            type: "pentagon",
            x: Math.min(startPoint.x, pos.x),
            y: Math.min(startPoint.y, pos.y),
            width,
            height,
            color,
            opacity: opacity / 100,
            lineWidth: brushSize,
            filled: fillShapes,
          };
          break;
        }
      }

      if (shapeData) {
        addShape(shapeData);
        // Don't draw directly - renderShapes will handle it
        // This prevents double-drawing and ensures proper selection rendering
      }

      // Clear preview canvas
      const previewCanvas = previewCanvasRef.current;
      if (previewCanvas) {
        const ctx = previewCanvas.getContext("2d");
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      }

      setIsDrawingShape(false);
      setStartPoint(null);
      saveToHistory();
      onDirtyChange(true); // Mark as dirty after drawing shape
    } else if (isDragging || isResizing) {
      // Save transformation history when operation completes
      if (originalShapes.length > 0) {
        saveTransform(originalShapes, shapes);
        setOriginalShapes([]); // Clear original shapes
      }
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);

      // Clear preview canvas to remove size indicator
      const previewCanvas = previewCanvasRef.current;
      if (previewCanvas) {
        const ctx = previewCanvas.getContext("2d");
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      }

      saveToHistory();
      onDirtyChange(true); // Mark as dirty after any drawing operation
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a title for your artwork");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description for your artwork");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const canvas = canvasRef.current;
      const imageBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      const canvasData = canvas.toDataURL();
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const artworkData = {
        title: title.trim(),
        description: description.trim(),
        tags: tagsArray,
        canvasData,
        isPublic,
        dimensions: {
          width: canvas.width,
          height: canvas.height,
        },
        tools: [tool, brushType],
        colors: [color],
      };

      if (onSave) {
        await onSave(artworkData, imageBlob);
        onDirtyChange(false); // Clear dirty state after successful save
      }
    } catch (err) {
      setError("Failed to save artwork. Please try again.");
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Canvas Area */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Digital Art Canvas</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Integrated Toolbar with Color Palette */}
            <div className="mb-4">
              <Toolbar
                tool={tool}
                setTool={setTool}
                brushType={brushType}
                setBrushType={setBrushType}
                brushSize={brushSize}
                setBrushSize={setBrushSize}
                opacity={opacity}
                setOpacity={setOpacity}
                fontSize={fontSize}
                setFontSize={setFontSize}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                fillShapes={fillShapes}
                setFillShapes={setFillShapes}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                gridSize={gridSize}
                setGridSize={setGridSize}
                onUndo={undo}
                onRedo={redo}
                onSave={handleSave}
                isSaving={isSaving}
                canUndo={historyIndex > 0 || transformIndex > 0}
                canRedo={
                  historyIndex < history.length - 1 ||
                  transformIndex < transformHistory.length - 1
                }
                brushTypes={brushTypes}
                fontFamilies={fontFamilies}
                colors={colors}
                selectedColor={color}
                onColorSelect={setColor}
              />
            </div>

            <Canvas
              canvasRef={canvasRef}
              gridCanvasRef={gridCanvasRef}
              previewCanvasRef={previewCanvasRef}
              tool={tool}
              brushType={brushType}
              brushSize={brushSize}
              color={color}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              showGrid={showGrid}
              gridSize={gridSize}
              drawGrid={drawGrid}
            />
          </CardContent>
        </Card>
      </div>

      {/* Artwork Details Panel - Below Canvas */}
      <div>
        <ArtworkDetails
          title={title}
          setTitle={handleTitleChange}
          description={description}
          setDescription={handleDescriptionChange}
          tags={tags}
          setTags={handleTagsChange}
          isPublic={isPublic}
          setIsPublic={handlePublicChange}
          error={error}
          isSaving={isSaving}
          onSave={handleSave}
        />
      </div>

      {/* Text Input Modal */}
      <TextModal
        isOpen={showTextModal}
        textInput={textInput}
        setTextInput={setTextInput}
        onSubmit={handleTextSubmit}
        onCancel={handleTextCancel}
      />
    </div>
  );
};

export default ArtCanvas;
