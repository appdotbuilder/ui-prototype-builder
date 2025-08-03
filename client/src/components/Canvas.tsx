
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Copy } from 'lucide-react';
import type { CanvasElement, CanvasData } from '../App';

interface CanvasProps {
  canvasData: CanvasData;
  selectedElement: CanvasElement | null;
  onSelectElement: (element: CanvasElement | null) => void;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (elementId: string) => void;
}

export function Canvas({ 
  canvasData, 
  selectedElement, 
  onSelectElement, 
  onUpdateElement, 
  onDeleteElement 
}: CanvasProps) {
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    elementId: string | null;
    offset: { x: number; y: number };
  }>({
    isDragging: false,
    elementId: null,
    offset: { x: 0, y: 0 }
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX = e.clientX - rect.left - element.position.x;
    const offsetY = e.clientY - rect.top - element.position.y;

    setDragState({
      isDragging: true,
      elementId: element.id,
      offset: { x: offsetX, y: offsetY }
    });

    onSelectElement(element);
  }, [onSelectElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.elementId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, e.clientX - rect.left - dragState.offset.x);
    const newY = Math.max(0, e.clientY - rect.top - dragState.offset.y);

    onUpdateElement(dragState.elementId, {
      position: { x: newX, y: newY }
    });
  }, [dragState, onUpdateElement]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      elementId: null,
      offset: { x: 0, y: 0 }
    });
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectElement(null);
    }
  }, [onSelectElement]);

  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedElement?.id === element.id;
    const isDragging = dragState.isDragging && dragState.elementId === element.id;

    const elementStyle = {
      position: 'absolute' as const,
      left: element.position.x,
      top: element.position.y,
      width: element.size.width,
      minHeight: element.size.height,
      cursor: isDragging ? 'grabbing' : 'grab',
      zIndex: isSelected ? 10 : 1
    };

    let content;

    switch (element.type) {
      case 'button':
        content = (
          <Button 
            variant={element.properties.variant as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" || 'default'}
            size={element.properties.size as "default" | "sm" | "lg" | "icon" || 'default'}
            className="w-full h-full"
          >
            {element.properties.text || 'Button'}
          </Button>
        );
        break;

      case 'input':
        content = (
          <Input
            placeholder={element.properties.placeholder as string || 'Enter text...'}
            type={element.properties.type as string || 'text'}
            className="w-full"
          />
        );
        break;

      case 'title': {
        const level = element.properties.level || 'h1';
        switch (level) {
          case 'h1':
            content = <h1 className="text-2xl font-bold text-gray-900">{element.properties.text || 'Title'}</h1>;
            break;
          case 'h2':
            content = <h2 className="text-xl font-bold text-gray-900">{element.properties.text || 'Title'}</h2>;
            break;
          case 'h3':
            content = <h3 className="text-lg font-bold text-gray-900">{element.properties.text || 'Title'}</h3>;
            break;
          case 'h4':
            content = <h4 className="text-base font-bold text-gray-900">{element.properties.text || 'Title'}</h4>;
            break;
          case 'h5':
            content = <h5 className="text-sm font-bold text-gray-900">{element.properties.text || 'Title'}</h5>;
            break;
          case 'h6':
            content = <h6 className="text-xs font-bold text-gray-900">{element.properties.text || 'Title'}</h6>;
            break;
          default:
            content = <h1 className="text-2xl font-bold text-gray-900">{element.properties.text || 'Title'}</h1>;
        }
        break;
      }

      case 'paragraph':
        content = (
          <p className="text-gray-600 leading-relaxed">
            {element.properties.text || 'This is a paragraph of text. You can edit this content in the properties panel.'}
          </p>
        );
        break;

      case 'image':
        content = (
          <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
            {element.properties.src ? (
              <img 
                src={element.properties.src as string} 
                alt={element.properties.alt as string || 'Image'} 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-2">🖼️</div>
                <div className="text-sm">Image Placeholder</div>
              </div>
            )}
          </div>
        );
        break;

      case 'card':
        content = (
          <Card className="w-full h-full">
            <CardHeader>
              <CardTitle>{element.properties.title || 'Card Title'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {element.properties.content || 'Card content goes here. You can customize this text in the properties panel.'}
              </p>
            </CardContent>
          </Card>
        );
        break;

      case 'container':
        content = (
          <div 
            className="w-full h-full border border-gray-200 rounded"
            style={{    
              backgroundColor: element.properties.backgroundColor as string || '#ffffff',
              padding: element.properties.padding as string || '16px'
            }}
          >
            <div className="text-center text-gray-400 text-sm">
              Container
              <br />
              <span className="text-xs">Drop elements here</span>
            </div>
          </div>
        );
        break;

      default:
        content = (
          <div className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
            <span className="text-gray-500 text-sm capitalize">{element.type}</span>
          </div>
        );
    }

    return (
      <div
        key={element.id}
        style={elementStyle}
        className={`group ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        onMouseDown={(e) => handleMouseDown(e, element)}
      >
        {content}
        
        {/* Selection Controls */}
        {isSelected && (
          <div className="absolute -top-8 left-0 flex items-center space-x-1 bg-white border border-gray-200 rounded shadow-sm px-2 py-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                // Duplicate functionality would be implemented in parent component
                console.log('Duplicate element:', element.id);
              }}
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDeleteElement(element.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Resize handles - simplified for demo */}
        {isSelected && (
          <>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-nw-resize" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-ne-resize" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-sw-resize" />
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-se-resize" />
          </>
        )}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full min-h-96 bg-white border border-gray-200 rounded-lg overflow-hidden"
      style={{ minHeight: '600px' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {canvasData.elements.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="text-gray-400">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-lg font-medium mb-2">Your canvas is empty</h3>
            <p className="text-sm">Start by adding components from the left panel</p>
          </div>
        </div>
      ) : (
        canvasData.elements.map(renderElement)
      )}
    </div>
  );
}
