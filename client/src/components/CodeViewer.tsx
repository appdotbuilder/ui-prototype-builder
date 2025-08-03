
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Check } from 'lucide-react';

interface CodeViewerProps {
  code: string;
}

export function CodeViewer({ code }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Component.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateCSS = () => {
    return `/* Generated Tailwind CSS styles */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component styles */
.component-container {
  @apply p-4 space-y-4;
}`;
  };

  const generateHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated UI Component</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <!-- Your component code would be included here -->
</body>
</html>`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-gray-900">Generated Code</h3>
          <Badge variant="secondary" className="text-xs">
            React + Tailwind
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopy}
            className="text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownload}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="react" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-2 w-fit">
            <TabsTrigger value="react" className="text-xs">React</TabsTrigger>
            <TabsTrigger value="css" className="text-xs">CSS</TabsTrigger>
            <TabsTrigger value="html" className="text-xs">HTML</TabsTrigger>
          </TabsList>

          <TabsContent value="react" className="flex-1 m-0 p-0">
            <div className="h-full overflow-auto">
              <pre className="text-xs p-4 font-mono bg-gray-50 text-gray-800 leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="css" className="flex-1 m-0 p-0">
            <div className="h-full overflow-auto">
              <pre className="text-xs p-4 font-mono bg-gray-50 text-gray-800 leading-relaxed">
                <code>{generateCSS()}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="html" className="flex-1 m-0 p-0">
            <div className="h-full overflow-auto">
              <pre className="text-xs p-4 font-mono bg-gray-50 text-gray-800 leading-relaxed">
                <code>{generateHTML()}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
