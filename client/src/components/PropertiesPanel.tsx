
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette, Layout, Type } from 'lucide-react';
import type { CanvasElement } from '../App';

interface PropertiesPanelProps {
  element: CanvasElement;
  onUpdateElement: (updates: Record<string, string | number | boolean>) => void;
}

export function PropertiesPanel({ element, onUpdateElement }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState('content');

  const handlePropertyChange = (property: string, value: string | number | boolean) => {
    onUpdateElement({ [property]: value });
  };

  const renderContentProperties = () => {
    switch (element.type) {
      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="button-text">Button Text</Label>
              <Input
                id="button-text"
                value={element.properties.text as string || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handlePropertyChange('text', e.target.value)
                }
                placeholder="Button text"
              />
            </div>
            <div>
              <Label htmlFor="button-variant">Variant</Label>
              <Select
                value={element.properties.variant as string || 'default'}
                onValueChange={(value: string) => handlePropertyChange('variant', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="destructive">Destructive</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="button-size">Size</Label>
              <Select
                value={element.properties.size as string || 'default'}
                onValueChange={(value: string) => handlePropertyChange('size', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="input-placeholder">Placeholder</Label>
              <Input
                id="input-placeholder"
                value={element.properties.placeholder as string || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handlePropertyChange('placeholder', e.target.value)
                }
                placeholder="Placeholder text"
              />
            </div>
            <div>
              <Label htmlFor="input-type">Input Type</Label>
              <Select
                value={element.properties.type as string || 'text'}
                onValueChange={(value: string) => handlePropertyChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="tel">Phone</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'title':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title-text">Title Text</Label>
              <Input
                id="title-text"
                value={element.properties.text as string || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handlePropertyChange('text', e.target.value)
                }
                placeholder="Title text"
              />
            </div>
            <div>
              <Label htmlFor="title-level">Heading Level</Label>
              <Select
                value={element.properties.level as string || 'h1'}
                onValueChange={(value: string) => handlePropertyChange('level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1 - Largest</SelectItem>
                  <SelectItem value="h2">H2 - Large</SelectItem>
                  <SelectItem value="h3">H3 - Medium</SelectItem>
                  <SelectItem value="h4">H4 - Small</SelectItem>
                  <SelectItem value="h5">H5 - Smaller</SelectItem>
                  <SelectItem value="h6">H6 - Smallest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'paragraph':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="paragraph-text">Paragraph Text</Label>
              <Textarea
                id="paragraph-text"
                value={element.properties.text as string || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  handlePropertyChange('text', e.target.value)
                }
                placeholder="Paragraph content"
                rows={4}
              />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-src">Image URL</Label>
              <Input
                id="image-src"
                value={element.properties.src as string || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handlePropertyChange('src', e.target.value)
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={element.properties.alt as string || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handlePropertyChange('alt', e.target.value)
                }
                placeholder="Describe the image"
              />
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="card-title">Card Title</Label>
              <Input
                id="card-title"
                value={element.properties.title as string || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handlePropertyChange('title', e.target.value)
                }
                placeholder="Card title"
              />
            </div>
            <div>
              <Label htmlFor="card-content">Card Content</Label>
              <Textarea
                id="card-content"
                value={element.properties.content as string || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  handlePropertyChange('content', e.target.value)
                }
                placeholder="Card content"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No properties available for this element type</p>
          </div>
        );
    }
  };

  const renderStyleProperties = () => (
    <div className="space-y-4">
      <div>
        <Label>Background Color</Label>
        <div className="flex items-center space-x-2 mt-1">
          <Input
            type="color"
            value={element.properties.backgroundColor as string || '#ffffff'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handlePropertyChange('backgroundColor', e.target.value)
            }
            className="w-12 h-8 p-1 border rounded"
          />
          <Input
            value={element.properties.backgroundColor as string || '#ffffff'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handlePropertyChange('backgroundColor', e.target.value)
            }
            placeholder="#ffffff"
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <Label>Text Color</Label>
        <div className="flex items-center space-x-2 mt-1">
          <Input
            type="color"
            value={element.properties.textColor as string || '#000000'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handlePropertyChange('textColor', e.target.value)
            }
            className="w-12 h-8 p-1 border rounded"
          />
          <Input
            value={element.properties.textColor as string || '#000000'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handlePropertyChange('textColor', e.target.value)
            }
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <Label>Border Radius</Label>
        <div className="mt-1">
          <Slider
            value={[element.properties.borderRadius as number || 0]}
            onValueChange={(value: number[]) => handlePropertyChange('borderRadius', value[0])}
            max={50}
            step={1}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            {element.properties.borderRadius || 0}px
          </div>
        </div>
      </div>

      <div>
        <Label>Padding</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <Input
            placeholder="Top"
            value={element.properties.paddingTop as string || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handlePropertyChange('paddingTop', e.target.value)
            }
          />
          <Input
            placeholder="Right"
            value={element.properties.paddingRight as string || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handlePropertyChange('paddingRight', e.target.value)
            }
          />
          <Input
            placeholder="Bottom"
            value={element.properties.paddingBottom as string || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handlePropertyChange('paddingBottom', e.target.value)
            }
          />
          <Input
            placeholder="Left"
            value={element.properties.paddingLeft as string || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handlePropertyChange('paddingLeft', e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );

  const renderLayoutProperties = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="width">Width</Label>
          <Input
            id="width"
            value={element.size.width}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              console.log('Width changed:', e.target.value);
              // This would need to be handled by the parent component
            }}
            type="number"
            placeholder="Width"
          />
        </div>
        <div>
          <Label htmlFor="height">Height</Label>
          <Input
            id="height"
            value={element.size.height}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              console.log('Height changed:', e.target.value);
              // This would need to be handled by the parent component
            }}
            type="number"
            
            placeholder="Height"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="x-position">X Position</Label>
          <Input
            id="x-position"
            value={element.position.x}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              console.log('X position changed:', e.target.value);
              // This would need to be handled by the parent component
            }}
            type="number"
            placeholder="X"
          />
        </div>
        <div>
          <Label htmlFor="y-position">Y Position</Label>
          <Input
            id="y-position"
            value={element.position.y}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              console.log('Y position changed:', e.target.value);
              // This would need to be handled by the parent component
            }}
            type="number"
            placeholder="Y"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="visible">Visible</Label>
          <Switch
            id="visible"
            checked={element.properties.visible !== false}
            onCheckedChange={(checked: boolean) => handlePropertyChange('visible', checked)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {element.type}
            </Badge>
            <span className="text-xs text-gray-500">#{element.id.slice(-8)}</span>
          </div>
        </div>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content" className="text-xs">
            <Type className="w-3 h-3 mr-1" />
            Content
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs">
            <Palette className="w-3 h-3 mr-1" />
            Style
          </TabsTrigger>
          <TabsTrigger value="layout" className="text-xs">
            <Layout className="w-3 h-3 mr-1" />
            Layout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          {renderContentProperties()}
        </TabsContent>

        <TabsContent value="style" className="mt-4">
          {renderStyleProperties()}
        </TabsContent>

        <TabsContent value="layout" className="mt-4">
          {renderLayoutProperties()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
