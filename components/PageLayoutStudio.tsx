import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GeneratedImage } from '../types';
import ImageGallery from './ImageGallery';
import LayoutIcon from './icons/LayoutIcon';
import DownloadIcon from './icons/DownloadIcon';
import TrashIcon from './icons/TrashIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import UploadIcon from './icons/UploadIcon';

interface PageLayoutStudioProps {
  panelLibrary: GeneratedImage[];
  characters: GeneratedImage[];
  scenes: GeneratedImage[];
  onAddPanel: (base64: string, name: string) => void;
  onImportPanels: (panels: GeneratedImage[]) => void;
}

interface PagePanel {
  id: string;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  zIndex: number;
  image: GeneratedImage;
}

// Page dimensions for export (300 DPI for 6.625" x 10.25")
const PAGE_EXPORT_WIDTH = 1988;
const PAGE_EXPORT_HEIGHT = 3075;

const PageLayoutStudio: React.FC<PageLayoutStudioProps> = ({ panelLibrary, characters, scenes, onAddPanel, onImportPanels }) => {
  const [panels, setPanels] = useState<PagePanel[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [actionState, setActionState] = useState<{
    type: 'drag' | 'resize';
    panelId: string;
    startX: number;
    startY: number;
    startWidth?: number;
    startHeight?: number;
  } | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  
  const addPanel = (image: GeneratedImage) => {
    const newPanel: PagePanel = {
      id: `panel-${Date.now()}`,
      x: 25,
      y: 25,
      width: 50,
      height: 30,
      zIndex: panels.length,
      image,
    };
    setPanels(prev => [...prev, newPanel]);
    setSelectedPanelId(newPanel.id);
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, panelId: string, type: 'drag' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPanelId(panelId);
    bringToFront(panelId);
    
    if (!pageRef.current) return;
    const pageBounds = pageRef.current.getBoundingClientRect();
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return;

    setActionState({
      type,
      panelId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: (panel.width / 100) * pageBounds.width,
      startHeight: (panel.height / 100) * pageBounds.height,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!actionState || !pageRef.current) return;
    e.preventDefault();

    const pageBounds = pageRef.current.getBoundingClientRect();
    const dx = e.clientX - actionState.startX;
    const dy = e.clientY - actionState.startY;

    setPanels(prevPanels => prevPanels.map(p => {
      if (p.id !== actionState.panelId) return p;

      if (actionState.type === 'drag') {
        const newX = p.x + (dx / pageBounds.width) * 100;
        const newY = p.y + (dy / pageBounds.height) * 100;
        return { ...p, x: newX, y: newY };
      } else { // resize
        const newWidth = (actionState.startWidth! + dx) / pageBounds.width * 100;
        const newHeight = (actionState.startHeight! + dy) / pageBounds.height * 100;
        return { ...p, width: Math.max(5, newWidth), height: Math.max(5, newHeight) };
      }
    }));
    
    // Update the start position for the next move event to get relative movement
    setActionState(prev => prev ? {...prev, startX: e.clientX, startY: e.clientY } : null);
  }, [actionState]);

  const handleMouseUp = useCallback(() => {
    setActionState(null);
  }, []);
  
  useEffect(() => {
    if (actionState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [actionState, handleMouseMove, handleMouseUp]);

  const bringToFront = (panelId: string) => {
    setPanels(prev => {
      const maxZ = Math.max(...prev.map(p => p.zIndex), 0);
      return prev.map(p => p.id === panelId ? { ...p, zIndex: maxZ + 1 } : p);
    });
  };
  
  const sendToBack = (panelId: string) => {
     setPanels(prev => {
      const minZ = Math.min(...prev.map(p => p.zIndex), 0);
      return prev.map(p => p.id === panelId ? { ...p, zIndex: minZ - 1 } : p);
    });
  };

  const deleteSelectedPanel = () => {
    if (selectedPanelId) {
      setPanels(prev => prev.filter(p => p.id !== selectedPanelId));
      setSelectedPanelId(null);
    }
  };

  const applyLayout = (layout: '2-panel-vertical' | '3-panel-vertical' | '4-grid') => {
    let newPanels: Omit<PagePanel, 'id' | 'image'>[] = [];
    if (layout === '2-panel-vertical') {
        newPanels = [
            { x: 5, y: 5, width: 90, height: 44, zIndex: 0 },
            { x: 5, y: 51, width: 90, height: 44, zIndex: 1 },
        ];
    } else if (layout === '3-panel-vertical') {
        newPanels = [
            { x: 5, y: 5, width: 90, height: 28, zIndex: 0 },
            { x: 5, y: 36, width: 90, height: 28, zIndex: 1 },
            { x: 5, y: 67, width: 90, height: 28, zIndex: 2 },
        ];
    } else if (layout === '4-grid') {
        newPanels = [
            { x: 5, y: 5, width: 44, height: 44, zIndex: 0 },
            { x: 51, y: 5, width: 44, height: 44, zIndex: 1 },
            { x: 5, y: 51, width: 44, height: 44, zIndex: 2 },
            { x: 51, y: 51, width: 44, height: 44, zIndex: 3 },
        ];
    }
    setPanels([]); // Clear current panels
    setSelectedPanelId(null);
    // Add new empty panels
    const emptyPanels: PagePanel[] = newPanels.map(p => ({
        ...p,
        id: `panel-${Date.now()}-${Math.random()}`,
        image: { id: '', base64: '', prompt: 'Empty Panel', name: 'Empty' } // Placeholder image
    }));
     setPanels(emptyPanels);
  };
  
  const handleImageClick = (image: GeneratedImage) => {
      if (selectedPanelId) {
          const selectedIsPlaceholder = panels.find(p => p.id === selectedPanelId)?.image.base64 === '';
          if (selectedIsPlaceholder) {
             // If a placeholder panel is selected, replace it
            setPanels(panels.map(p => p.id === selectedPanelId ? {...p, image } : p));
            return;
          }
      }
      // Otherwise, add a new panel
      addPanel(image);
  };
  
  const exportToJpeg = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = PAGE_EXPORT_WIDTH;
    canvas.height = PAGE_EXPORT_HEIGHT;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      alert("Failed to create canvas context for export.");
      return;
    }
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sortedPanels = [...panels].sort((a, b) => a.zIndex - b.zIndex);

    for (const panel of sortedPanels) {
        if (panel.image.base64) {
            await new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const x = (panel.x / 100) * canvas.width;
                    const y = (panel.y / 100) * canvas.height;
                    const width = (panel.width / 100) * canvas.width;
                    const height = (panel.height / 100) * canvas.height;
                    ctx.drawImage(img, x, y, width, height);
                    resolve();
                };
                img.onerror = () => {
                    console.error("Failed to load image for export:", panel.image.prompt);
                    resolve(); // Continue even if one image fails
                };
                img.src = `data:image/jpeg;base64,${panel.image.base64}`;
            });
        }
    }
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `comic-page-${Date.now()}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const base64WithMime = e.target?.result;
          if (typeof base64WithMime === 'string') {
            const name = window.prompt("Please enter a name for the uploaded panel:", file.name.replace(/\.[^/.]+$/, ""));
            if (name && name.trim()) {
              const base64 = base64WithMime.split(',')[1];
              onAddPanel(base64, name.trim());
            } else if (name !== null) {
              alert("Panel name cannot be empty.");
            }
          }
        } catch (error) {
          console.error("Error reading image file:", error);
          alert("Could not import panel from image.");
        }
      };
      reader.readAsDataURL(file);
      event.target.value = ''; // Reset file input
    }
  };
  
  const handleJsonImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const importedPanels = JSON.parse(content);
            onImportPanels(importedPanels);
          }
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert("Could not import panel library. The file may be corrupt or in the wrong format.");
        }
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset file input
    }
  };
  
  const handleExportLibrary = () => {
    if (panelLibrary.length === 0) {
        alert("Panel library is empty.");
        return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(panelLibrary, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "comic-panels.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  const triggerUpload = () => uploadInputRef.current?.click();
  const triggerImport = () => importInputRef.current?.click();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4 h-[80vh] overflow-y-auto pr-2">
        <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-700">
            <h3 className="text-lg font-semibold mb-2">Page Tools</h3>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => applyLayout('2-panel-vertical')} className="p-2 bg-zinc-800 text-sm rounded-lg hover:bg-zinc-700">2 Panels</button>
                <button onClick={() => applyLayout('3-panel-vertical')} className="p-2 bg-zinc-800 text-sm rounded-lg hover:bg-zinc-700">3 Panels</button>
                <button onClick={() => applyLayout('4-grid')} className="p-2 bg-zinc-800 text-sm rounded-lg hover:bg-zinc-700">4 Grid</button>
                <button onClick={deleteSelectedPanel} disabled={!selectedPanelId} className="p-2 bg-zinc-800 text-sm rounded-lg hover:bg-red-500/50 disabled:bg-zinc-900 disabled:cursor-not-allowed flex items-center justify-center gap-1"><TrashIcon className="w-4 h-4" /> Delete</button>
                <button onClick={() => selectedPanelId && bringToFront(selectedPanelId)} disabled={!selectedPanelId} className="p-2 bg-zinc-800 text-sm rounded-lg hover:bg-zinc-700 disabled:bg-zinc-900 disabled:cursor-not-allowed flex items-center justify-center gap-1"><ArrowUpIcon className="w-4 h-4" /> Front</button>
                <button onClick={() => selectedPanelId && sendToBack(selectedPanelId)} disabled={!selectedPanelId} className="p-2 bg-zinc-800 text-sm rounded-lg hover:bg-zinc-700 disabled:bg-zinc-900 disabled:cursor-not-allowed flex items-center justify-center gap-1"><ArrowDownIcon className="w-4 h-4" /> Back</button>
            </div>
             <button onClick={exportToJpeg} className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg p-3 hover:opacity-90 flex items-center justify-center gap-2">
                <DownloadIcon className="w-5 h-5" /> Export Page to JPEG
            </button>
        </div>
        <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-700">
            <h3 className="text-lg font-semibold mb-2">Panel Asset Library</h3>
            <p className="text-xs text-slate-400 mb-3">Manage your collection of final panels. You can save your library to a file to use later.</p>
            <div className="grid grid-cols-1 gap-2">
                <button onClick={triggerUpload} className="p-2 bg-zinc-800 text-sm rounded-lg hover:bg-zinc-700 flex items-center justify-center gap-2" title="Upload a single JPEG/PNG panel to your library">
                    <UploadIcon className="w-4 h-4" /> Upload Panel Image
                </button>
                <button onClick={triggerImport} className="p-2 bg-zinc-800 text-sm rounded-lg hover:bg-zinc-700" title="Load a panel library from a .json file">Import Library</button>
                <button onClick={handleExportLibrary} disabled={panelLibrary.length === 0} className="p-2 bg-zinc-800 text-sm rounded-lg hover:bg-zinc-700 disabled:bg-zinc-900 disabled:cursor-not-allowed" title="Save your current panel library to a .json file">Export Library</button>
            </div>
            <input type="file" ref={uploadInputRef} onChange={handleImageUpload} accept="image/jpeg,image/png" className="hidden" />
            <input type="file" ref={importInputRef} onChange={handleJsonImport} accept=".json" className="hidden" />
        </div>
        <ImageGallery title="Click to Add/Replace Panel" images={panelLibrary} isSelectable onSelect={handleImageClick} maxItems={12} />
        <ImageGallery title="Characters" images={characters} isSelectable onSelect={handleImageClick} />
        <ImageGallery title="Scenes" images={scenes} isSelectable onSelect={handleImageClick} maxItems={8} />
      </div>

      {/* Page Composer */}
      <div className="lg:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <LayoutIcon className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl font-semibold">Page Composer</h2>
        </div>
        <div ref={pageRef} className="relative w-full bg-white rounded-lg shadow-2xl aspect-[1988/3075] overflow-hidden"
          onMouseUp={handleMouseUp}
        >
          {panels.map((panel) => (
            <div
              key={panel.id}
              className={`absolute cursor-grab active:cursor-grabbing`}
              style={{
                left: `${panel.x}%`,
                top: `${panel.y}%`,
                width: `${panel.width}%`,
                height: `${panel.height}%`,
                zIndex: panel.zIndex,
                outline: selectedPanelId === panel.id ? '2px solid #3b82f6' : '1px solid #4b5563',
                outlineOffset: '2px',
              }}
              onMouseDown={(e) => handleMouseDown(e, panel.id, 'drag')}
            >
              {panel.image.base64 ? (
                 <img src={`data:image/jpeg;base64,${panel.image.base64}`} alt={panel.image.prompt} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-center p-2">Click an asset to fill this panel</div>
              )}
             
              {selectedPanelId === panel.id && (
                <div
                  className="absolute -right-1 -bottom-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize"
                  onMouseDown={(e) => handleMouseDown(e, panel.id, 'resize')}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageLayoutStudio;
