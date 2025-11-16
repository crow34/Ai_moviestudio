import React, { useState } from 'react';
import SparkleIcon from './icons/SparkleIcon';
import UserIcon from './icons/UserIcon';
import ImageIcon from './icons/ImageIcon';
import LayersIcon from './icons/LayersIcon';
import PaintBrushIcon from './icons/PaintBrushIcon';
import FireIcon from './icons/FireIcon';
import CubeIcon from './icons/CubeIcon';
import HomeIcon from './icons/HomeIcon';
import { View } from '../App';
import { ArtStyle } from '../types';
import { ART_STYLES } from '../constants';
import BurgerMenuIcon from './icons/BurgerMenuIcon';
import XMarkIcon from './icons/XMarkIcon';
import SettingsIcon from './icons/SettingsIcon';
import VideoIcon from './icons/VideoIcon';
import ScissorsIcon from './icons/ScissorsIcon';
import BookIcon from './icons/BookIcon';
import BookOpenIcon from './icons/BookOpenIcon';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  artStyle: ArtStyle;
  setArtStyle: (style: ArtStyle) => void;
  onOpenSettings: () => void;
}

const MobileNavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-lg font-semibold transition-colors ${
      isActive
        ? 'bg-white/10 text-white'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
    aria-label={label}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-white/10 text-white'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
    aria-label={label}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, artStyle, setArtStyle, onOpenSettings }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavClick = (view: View) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-zinc-950/70 backdrop-blur-lg sticky top-0 z-40 py-3 px-4 sm:px-8 border-b border-zinc-800">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <SparkleIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 hidden md:block">
              AI Comic Studio
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             <div className="relative flex items-center bg-zinc-900/70 border border-zinc-700 p-1 rounded-xl">
              <PaintBrushIcon className="w-5 h-5 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
                className="bg-transparent border-0 rounded-md py-1.5 pl-7 sm:pl-9 pr-2 sm:pr-3 text-sm font-semibold text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                aria-label="Select Art Style"
              >
                {ART_STYLES.map(style => (
                    <option key={style.value} value={style.value} className="bg-zinc-800 text-base">{style.label}</option>
                ))}
              </select>
            </div>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 p-1 bg-zinc-900/70 border border-zinc-700 rounded-xl">
               <NavButton
                label="Home"
                icon={<HomeIcon className="w-5 h-5" />}
                isActive={activeView === 'home'}
                onClick={() => setActiveView('home')}
              />
              <NavButton
                label="Character"
                icon={<UserIcon className="w-5 h-5" />}
                isActive={activeView === 'character'}
                onClick={() => setActiveView('character')}
              />
              <NavButton
                label="Scene"
                icon={<ImageIcon className="w-5 h-5" />}
                isActive={activeView === 'scene'}
                onClick={() => setActiveView('scene')}
              />
               <NavButton
                label="Script"
                icon={<BookIcon className="w-5 h-5" />}
                isActive={activeView === 'script'}
                onClick={() => setActiveView('script')}
              />
              <NavButton
                label="Props"
                icon={<CubeIcon className="w-5 h-5" />}
                isActive={activeView === 'props'}
                onClick={() => setActiveView('props')}
              />
               <NavButton
                label="VFX"
                icon={<FireIcon className="w-5 h-5" />}
                isActive={activeView === 'vfx'}
                onClick={() => setActiveView('vfx')}
              />
              <NavButton
                label="Editor"
                icon={<LayersIcon className="w-5 h-5" />}
                isActive={activeView === 'editor'}
                onClick={() => setActiveView('editor')}
              />
              <NavButton
                label="Video"
                icon={<VideoIcon className="w-5 h-5" />}
                isActive={activeView === 'video'}
                onClick={() => setActiveView('video')}
              />
              <NavButton
                label="Post-Prod"
                icon={<ScissorsIcon className="w-5 h-5" />}
                isActive={activeView === 'postproduction'}
                onClick={() => setActiveView('postproduction')}
              />
               <NavButton
                label="Cover"
                icon={<BookOpenIcon className="w-5 h-5" />}
                isActive={activeView === 'cover'}
                onClick={() => setActiveView('cover')}
              />
            </nav>
            <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Open settings"
            >
                <SettingsIcon className="w-6 h-6" />
            </button>
            {/* Mobile Nav Trigger */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Open navigation menu"
              >
                <BurgerMenuIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-lg z-50 flex flex-col p-4 md:hidden" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <SparkleIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">AI Comic Studio</h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Close navigation menu"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            <MobileNavButton label="Home" icon={<HomeIcon className="w-6 h-6" />} isActive={activeView === 'home'} onClick={() => handleMobileNavClick('home')} />
            <MobileNavButton label="Character" icon={<UserIcon className="w-6 h-6" />} isActive={activeView === 'character'} onClick={() => handleMobileNavClick('character')} />
            <MobileNavButton label="Scene" icon={<ImageIcon className="w-6 h-6" />} isActive={activeView === 'scene'} onClick={() => handleMobileNavClick('scene')} />
            <MobileNavButton label="Script" icon={<BookIcon className="w-6 h-6" />} isActive={activeView === 'script'} onClick={() => handleMobileNavClick('script')} />
            <MobileNavButton label="Props" icon={<CubeIcon className="w-6 h-6" />} isActive={activeView === 'props'} onClick={() => handleMobileNavClick('props')} />
            <MobileNavButton label="VFX" icon={<FireIcon className="w-6 h-6" />} isActive={activeView === 'vfx'} onClick={() => handleMobileNavClick('vfx')} />
            <MobileNavButton label="Editor" icon={<LayersIcon className="w-6 h-6" />} isActive={activeView === 'editor'} onClick={() => handleMobileNavClick('editor')} />
            <MobileNavButton label="Video" icon={<VideoIcon className="w-6 h-6" />} isActive={activeView === 'video'} onClick={() => handleMobileNavClick('video')} />
            <MobileNavButton label="Post-Prod" icon={<ScissorsIcon className="w-6 h-6" />} isActive={activeView === 'postproduction'} onClick={() => handleMobileNavClick('postproduction')} />
            <MobileNavButton label="Cover" icon={<BookOpenIcon className="w-6 h-6" />} isActive={activeView === 'cover'} onClick={() => handleMobileNavClick('cover')} />
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;