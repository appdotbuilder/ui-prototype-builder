
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Palette, 
  Code, 
  Download, 
  Copy, 
  Smartphone, 
  Tablet, 
  Monitor, 
  FolderOpen,
  User,
  Save,
  Play,
  Layout
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Project } from '../../server/src/schema';
import { ComponentPalette } from '@/components/ComponentPalette';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { CodeViewer } from '@/components/CodeViewer';
import { Canvas } from '@/components/Canvas';
import { ProjectDashboard } from '@/components/ProjectDashboard';
import { AuthLogin } from '@/components/AuthLogin';

export interface CanvasElement {
  id: string;
  type: string;
  properties: Record<string, string | number | boolean>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  children?: CanvasElement[];
}

export interface CanvasData {
  elements: CanvasElement[];
  viewport: {
    zoom: number;
    offset: { x: number; y: number };
  };
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

function App() {
  // Authentication state
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  
  // App state
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Editor state
  const [canvasData, setCanvasData] = useState<CanvasData>({
    elements: [],
    viewport: { zoom: 1, offset: { x: 0, y: 0 } }
  });
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [showCode, setShowCode] = useState(false);

  // Initialize with demo user for development purposes
  useEffect(() => {
    const demoUser = { id: 1, name: 'Demo User', email: 'demo@example.com' };
    setUser(demoUser);
  }, []);

  const loadProjects = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userProjects = await trpc.getProjectsByUserId.query({ user_id: user.id });
      setProjects(userProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, loadProjects]);

  const handleCreateProject = async (name: string, description?: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const newProject = await trpc.createProject.mutate({
        user_id: user.id,
        name,
        description: description || null,
        canvas_data: JSON.stringify({ elements: [], viewport: { zoom: 1, offset: { x: 0, y: 0 } } }),
        is_public: false
      });
      
      setProjects(prev => [...prev, newProject]);
      setCurrentProject(newProject);
      setCanvasData({ elements: [], viewport: { zoom: 1, offset: { x: 0, y: 0 } } });
      setCurrentView('editor');
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    try {
      const parsedCanvasData = JSON.parse(project.canvas_data) as CanvasData;
      setCanvasData(parsedCanvasData);
    } catch (error) {
      console.error('Failed to parse canvas data:', error);
      setCanvasData({ elements: [], viewport: { zoom: 1, offset: { x: 0, y: 0 } } });
    }
    setCurrentView('editor');
  };

  const handleSaveProject = async () => {
    if (!currentProject || !user) return;

    try {
      setIsLoading(true);
      const updatedProject = await trpc.updateProject.mutate({
        id: currentProject.id,
        user_id: user.id,
        canvas_data: JSON.stringify(canvasData)
      });
      
      setCurrentProject(updatedProject);
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddElement = (elementType: string) => {
    const newElement: CanvasElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: elementType,
      properties: getDefaultProperties(elementType),
      position: { x: 50, y: 50 },
      size: { width: 200, height: 100 }
    };

    setCanvasData(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  };

  const getDefaultProperties = (type: string): Record<string, string | number | boolean> => {
    switch (type) {
      case 'button':
        return { text: 'Button', variant: 'default', size: 'default' };
      case 'input':
        return { placeholder: 'Enter text...', type: 'text' };
      case 'title':
        return { text: 'Title', level: 'h1' };
      case 'paragraph':
        return { text: 'This is a paragraph of text.' };
      case 'image':
        return { src: '', alt: 'Image', width: '200px', height: '150px' };
      case 'card': {
        return { title: 'Card Title', content: 'Card content goes here.' };
      }
      case 'container':
        return { padding: '16px', backgroundColor: '#ffffff' };
      default:
        return {};
    }
  };

  const handleCopyCode = () => {
    const code = generateReactCode(canvasData.elements);
    navigator.clipboard.writeText(code);
  };

  const generateReactCode = (elements: CanvasElement[]): string => {
    const imports = new Set(['import React from "react";']);
    const components: string[] = [];

    elements.forEach(element => {
      switch (element.type) {
        case 'button':
          imports.add('import { Button } from "@/components/ui/button";');
          components.push(`<Button variant="${element.properties.variant || 'default'}">${element.properties.text || 'Button'}</Button>`);
          break;
        case 'input':
          imports.add('import { Input } from "@/components/ui/input";');
          components.push(`<Input placeholder="${element.properties.placeholder || ''}" type="${element.properties.type || 'text'}" />`);
          break;
        case 'title': {
          const level = element.properties.level || 'h1';
          components.push(`<${level} className="text-2xl font-bold">${element.properties.text || 'Title'}</${level}>`);
          break;
        }
        case 'paragraph':
          components.push(`<p className="text-gray-600">${element.properties.text || 'Paragraph'}</p>`);
          break;
        case 'card':
          imports.add('import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";');
          components.push(`<Card>
  <CardHeader>
    <CardTitle>${element.properties.title || 'Card Title'}</CardTitle>
  </CardHeader>
  <CardContent>
    <p>${element.properties.content || 'Card content'}</p>
  </CardContent>
</Card>`);
          break;
        default:
          components.push(`<div className="p-4 border rounded">${element.type}</div>`);
      }
    });

    return `${Array.from(imports).join('\n')}

export default function Component() {
  return (
    <div className="p-4 space-y-4">
      ${components.join('\n      ')}
    </div>
  );
}`;
  };

  const getViewportClass = () => {
    switch (viewportMode) {
      case 'mobile': return 'max-w-sm';
      case 'tablet': return 'max-w-2xl';
      case 'desktop': return 'max-w-full';
      default: return 'max-w-full';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Welcome to UI Designer</CardTitle>
          </CardHeader>
          <CardContent>
            <AuthLogin onLogin={setUser} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Layout className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">UI Designer</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </header>

        <ProjectDashboard 
          projects={projects}
          isLoading={isLoading}
          onCreateProject={handleCreateProject}
          onOpenProject={handleOpenProject}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setCurrentView('dashboard')}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-2">
            <Layout className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-900">
              {currentProject?.name || 'Untitled Project'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Viewport Controls */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewportMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportMode('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={viewportMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportMode('tablet')}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={viewportMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportMode('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Action Buttons */}
          <Button variant="outline" size="sm" onClick={handleSaveProject} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          
          <Button variant="outline" size="sm">
            <Play className="w-4 h-4 mr-2" />
            Preview
          </Button>

          <Button variant="outline" size="sm" onClick={handleCopyCode}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Code
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Palette - Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <ComponentPalette onAddElement={handleAddElement} />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-100 p-4 overflow-auto">
            <div className={`mx-auto bg-white shadow-sm border rounded-lg transition-all duration-200 ${getViewportClass()}`}>
              <Canvas
                canvasData={canvasData}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                onUpdateElement={(elementId, updates) => {
                  setCanvasData(prev => ({
                    ...prev,
                    elements: prev.elements.map(el => 
                      el.id === elementId ? { ...el, ...updates } : el
                    )
                  }));
                }}
                onDeleteElement={(elementId) => {
                  setCanvasData(prev => ({
                    ...prev,
                    elements: prev.elements.filter(el => el.id !== elementId)
                  }));
                  setSelectedElement(null);
                }}
              />
            </div>
          </div>

          {/* Bottom Code Panel */}
          {showCode && (
            <div className="h-64 border-t border-gray-200 bg-white">
              <CodeViewer code={generateReactCode(canvasData.elements)} />
            </div>
          )}
        </div>

        {/* Properties Panel - Right Sidebar */}
        {selectedElement && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <PropertiesPanel
              element={selectedElement}
              onUpdateElement={(updates) => {
                setCanvasData(prev => ({
                  ...prev,
                  elements: prev.elements.map(el => 
                    el.id === selectedElement.id ? { ...el, properties: { ...el.properties, ...updates } } : el
                  )
                }));
                setSelectedElement(prev => prev ? { ...prev, properties: { ...prev.properties, ...updates } } : null);
              }}
            />
          </div>
        )}
      </div>

      {/* Mobile/Tablet Responsive Panels */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              className="fixed bottom-4 left-4 z-50"
              size="sm"
            >
              <Palette className="w-4 h-4 mr-2" />
              Components
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Components</SheetTitle>
            </SheetHeader>
            <ComponentPalette onAddElement={handleAddElement} />
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button 
              className="fixed bottom-4 right-4 z-50"
              size="sm"
              onClick={() => setShowCode(!showCode)}
            >
              <Code className="w-4 h-4 mr-2" />
              Code
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-64">
            <SheetHeader>
              <SheetTitle>Generated Code</SheetTitle>
            </SheetHeader>
            <CodeViewer code={generateReactCode(canvasData.elements)} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export default App;
