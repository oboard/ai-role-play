'use client';

import { useState } from 'react';
import { FileText, Clock, Eye, AlertTriangle, Star, Zap, CheckCircle } from 'lucide-react';
import { Evidence } from '@/types/game';
import { useTranslation } from '@/lib/i18n';

interface EvidenceNotebookProps {
  evidence: Evidence[];
}

export default function EvidenceNotebook({ evidence }: EvidenceNotebookProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const { t } = useTranslation();

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'high':
        return <AlertTriangle size={16} className="text-red-400" />;
      case 'medium':
        return <Eye size={16} className="text-yellow-400" />;
      case 'low':
        return <CheckCircle size={16} className="text-green-400" />;
      default:
        return <Eye size={16} className="text-slate-400" />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'border-red-400 bg-red-900/20';
      case 'medium':
        return 'border-yellow-400 bg-yellow-900/20';
      case 'low':
        return 'border-green-400 bg-green-900/20';
      default:
        return 'border-slate-600 bg-slate-700';
    }
  };

  return (
    <div className="h-full bg-slate-800 rounded-lg border border-slate-600 flex flex-col">
      <div className="h-12 bg-slate-700 flex items-center px-4 border-b border-slate-600">
        <FileText size={20} className="text-amber-400 mr-2" />
        <span className="text-amber-400 font-semibold">{t('evidenceNotebook')}</span>
        <span className="ml-auto text-sm text-slate-400">({evidence.length})</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {evidence.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-slate-400 p-4">
            <div>
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('noEvidenceYet')}</p>
              <p className="text-sm mt-2">{t('noEvidenceDesc')}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {evidence.map((item, index) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  getImportanceColor(item.importance)
                } hover:shadow-lg`}
                onClick={() => setSelectedEvidence(item)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getImportanceIcon(item.importance)}
                    <span className="text-xs text-slate-400">Evidence #{index + 1}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Clock size={12} />
                    <span>{item.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-200 leading-relaxed mb-2">
                  {item.content.length > 100 
                    ? `${item.content.substring(0, 100)}...` 
                    : item.content
                  }
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                    {t('source')}: {item.source}
                  </span>
                  <button className="text-slate-400 hover:text-amber-400 transition-colors">
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Detail Modal */}
      {selectedEvidence && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 max-w-md w-full mx-4 max-h-[80%] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getImportanceIcon(selectedEvidence.importance)}
                <h3 className="text-lg font-semibold text-amber-400">{t('evidenceDetails')}</h3>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">{t('content')}:</label>
                <p className="text-slate-200 mt-1 leading-relaxed">{selectedEvidence.content}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">{t('source')}:</label>
                  <p className="text-slate-200">{selectedEvidence.source}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">{t('importance')}:</label>
                  <div className="flex items-center space-x-1 mt-1">
                    {getImportanceIcon(selectedEvidence.importance)}
                    <span className="text-slate-200 capitalize">{selectedEvidence.importance}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-slate-400">{t('collectedAt')}:</label>
                <p className="text-slate-200">{selectedEvidence.timestamp.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedEvidence(null)}
                className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}