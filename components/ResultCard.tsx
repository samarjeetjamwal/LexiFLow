import React, { useState } from 'react';
import { Copy, Check, Share2, Briefcase, GraduationCap, Coffee, Hash, Zap, PencilLine } from 'lucide-react';

interface ResultCardProps {
  title: string;
  content: string;
  explanation?: string;
  variant?: 'primary' | 'secondary' | 'neutral';
  iconType?: string;
  onUse?: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, content, explanation, variant = 'neutral', iconType, onUse }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = () => {
    switch (iconType?.toLowerCase()) {
      case 'professional': return <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'formal': return <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'informal': return <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'social': return <Hash className="w-5 h-5 text-pink-600 dark:text-pink-400" />;
      case 'persuasive': return <Zap className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />;
      default: return <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getCardStyles = () => {
    if (variant === 'primary') {
      return 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-400/50';
    }
    if (variant === 'secondary') {
      return 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 dark:border-emerald-400/50';
    }
    return 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors';
  };

  return (
    <div className={`rounded-xl border p-5 shadow-sm flex flex-col gap-3 relative group ${getCardStyles()}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {variant !== 'primary' && getIcon()}
          <h3 className={`font-semibold ${variant === 'primary' ? 'text-lg text-indigo-900 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'}`}>
            {title}
          </h3>
          {variant === 'primary' && <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">Standard</span>}
        </div>
        
        <div className="flex items-center gap-1">
          {onUse && (
            <button
              onClick={onUse}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Use this version as input"
            >
              <PencilLine className="w-4 h-4" />
              <span className="hidden sm:inline">Use This</span>
            </button>
          )}
          
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
        {content}
      </div>

      {explanation && (
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3 mt-1 italic">
          <span className="font-semibold not-italic text-gray-400 dark:text-gray-500">Why: </span>
          {explanation}
        </div>
      )}
    </div>
  );
};

export default ResultCard;