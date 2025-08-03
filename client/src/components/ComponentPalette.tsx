
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MousePointer, 
  Square, 
  Type, 
  Image, 
  Layers, 
  Grid3x3,
  Menu,
  CheckSquare,
  Circle,
  ChevronDown,
  MessageSquare,
  TabletSmartphone,
  Layers3,
  Zap,
  Layout,
  Minus,
  AlignJustify
} from 'lucide-react';

interface ComponentPaletteProps {
  onAddElement: (elementType: string) => void;
}

const componentCategories = [
  {
    title: 'Basic Elements',
    components: [
      { type: 'button', icon: MousePointer, label: 'Button' },
      { type: 'input', icon: Type, label: 'Input' },
      { type: 'title', icon: Type, label: 'Title' },
      { type: 'paragraph', icon: Type, label: 'Paragraph' },
      { type: 'image', icon: Image, label: 'Image' },
    ]
  },
  {
    title: 'Layout',
    components: [
      { type: 'container', icon: Square, label: 'Container' },
      { type: 'card', icon: Layers, label: 'Card' },
      { type: 'grid', icon: Grid3x3, label: 'Grid' },
      { type: 'layout', icon: Layout, label: 'Layout' },
    ]
  },
  {
    title: 'Form Elements',
    components: [
      { type: 'checkbox', icon: CheckSquare, label: 'Checkbox' },
      { type: 'radio', icon: Circle, label: 'Radio' },
      { type: 'select', icon: ChevronDown, label: 'Select' },
      { type: 'textarea', icon: MessageSquare, label: 'Textarea' },
    ]
  },
  {
    title: 'Interactive',
    components: [
      { type: 'tab', icon: TabletSmartphone, label: 'Tabs' },
      { type: 'accordion', icon: Layers3, label: 'Accordion' },
      { type: 'modal', icon: Zap, label: 'Modal' },
    ]
  },
  {
    title: 'Navigation',
    components: [
      { type: 'navbar', icon: Minus, label: 'Navbar' },
      { type: 'footer', icon: AlignJustify, label: 'Footer' },
      { type: 'menu', icon: Menu, label: 'Menu' },
    ]
  }
];

export function ComponentPalette({ onAddElement }: ComponentPaletteProps) {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Components</h3>
        <p className="text-sm text-gray-600">Drag and drop to add to canvas</p>
      </div>

      {componentCategories.map((category, categoryIndex) => (
        <div key={categoryIndex}>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            {category.title}
            <Badge variant="secondary" className="ml-2 text-xs">
              {category.components.length}
            </Badge>
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            {category.components.map((component) => (
              <Button
                key={component.type}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center justify-center text-xs hover:bg-blue-50 hover:border-blue-200"
                onClick={() => onAddElement(component.type)}
              >
                <component.icon className="w-5 h-5 mb-1 text-gray-600" />
                <span className="text-gray-700">{component.label}</span>
              </Button>
            ))}
          </div>
          
          
          {categoryIndex < componentCategories.length - 1 && (
            <Separator className="mt-4" />
          )}
        </div>
      ))}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-900">💡 Pro Tip</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-blue-700">
            Click on any component to add it to your canvas. You can then customize its properties in the sidebar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
