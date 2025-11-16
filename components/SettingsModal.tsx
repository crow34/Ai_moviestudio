import React, { useState, useEffect } from 'react';
import XMarkIcon from './icons/XMarkIcon';

export interface ApiSettings {
  useCustomKey: boolean;
  apiKey: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: ApiSettings;
  onSave: (settings: ApiSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [useCustomKey, setUseCustomKey] = useState(currentSettings.useCustomKey);
  const [apiKey, setApiKey] = useState(currentSettings.apiKey);

  useEffect(() => {
    if (isOpen) {
        setUseCustomKey(currentSettings.useCustomKey);
        setApiKey(currentSettings.apiKey);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave({ useCustomKey, apiKey });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md m-4 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-100">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Close settings">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-200">API Key Management</h3>
            <p className="text-sm text-slate-400 mt-1">
              If you encounter 'Quota Exceeded' errors, you can use your own Gemini API key. Your key is saved only in your browser's local storage and is never sent to our servers.
            </p>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={useCustomKey} onChange={(e) => setUseCustomKey(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-slate-300">Use Custom Gemini API Key</span>
          </label>

          <div>
            <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-400 mb-1">
              Your Gemini API Key
            </label>
            <input
              id="api-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-zinc-800 disabled:cursor-not-allowed"
              disabled={!useCustomKey}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="bg-zinc-800 text-white font-semibold rounded-lg px-4 py-2 hover:bg-zinc-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors">
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;