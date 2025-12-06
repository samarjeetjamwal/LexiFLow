import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, Trash2, Wand2, AlertCircle, MessageSquareText, Sun, Moon, Download, ArrowUpLeft } from 'lucide-react';
import { enhanceText } from './services/geminiService';
import { calculateStats, getReadabilityLabel } from './utils/textUtils';
import { EnhancementResult, TextStats } from './types';
import ResultCard from './components/ResultCard';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnhancementResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TextStats>({ wordCount: 0, charCount: 0, readabilityScore: 0, readingTime: 0 });
  
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Use ref to scroll to results on complete or input on use
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Apply dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    setStats(calculateStats(text));
    setError(null);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError(null);
    setStats({ wordCount: 0, charCount: 0, readabilityScore: 0, readingTime: 0 });
  };

  const handleUseVariation = (text: string) => {
    setInputText(text);
    setStats(calculateStats(text));
    setResult(null); // Clear results since input has changed
    // Scroll back to top/input on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
    inputRef.current?.focus();
  };

  const handleDownload = () => {
    if (!result) return;
    
    const lines = [
      "LEXIFLOW AI ENHANCEMENT REPORT",
      "==============================",
      "",
      "ORIGINAL TEXT:",
      inputText,
      "",
      "------------------------------",
      "",
      "STANDARD CORRECTED VERSION:",
      result.correctedText,
      "",
      "------------------------------",
      "",
      "STYLISTIC VARIATIONS:",
      ""
    ];

    result.variations.forEach(v => {
      lines.push(`[${v.style}]`);
      lines.push(v.text);
      lines.push(`Why: ${v.explanation}`);
      lines.push("");
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LexiFlow-Enhancement-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEnhance = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to enhance.");
      return;
    }

    if (inputText.trim().split(/\s+/).length > 600) {
      setError("Text is too long. Please limit to approximately 500 words.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await enhanceText(inputText);
      
      if (!data.isValidEnglish) {
        setError("The input text appears to be non-English or heavily garbled. Please try again with clearer English text.");
      } else {
        setResult(data);
        // Small delay to allow DOM to update before scrolling
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (err) {
      setError("An error occurred while communicating with the AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const readability = getReadabilityLabel(stats.readabilityScore);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-30 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              LexiFlow Created By Samar Jeet Jamwal
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:block">
              AI-Powered Text Enhancer
            </div>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Input Area */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto transition-colors duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <MessageSquareText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                Input Text
              </h2>
              <div className="text-xs font-mono text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded">
                {stats.wordCount} words
              </div>
            </div>

            <textarea
              ref={inputRef}
              className="w-full flex-grow p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all text-gray-700 dark:text-gray-200 text-base leading-relaxed placeholder-gray-400 dark:placeholder-gray-600 min-h-[200px]"
              placeholder="Paste your text here (up to 500 words)...&#10;e.g., 'i need to send email to boss asking for raise'"
              value={inputText}
              onChange={handleInputChange}
              disabled={loading}
            />

            {/* Stats Bar */}
            {stats.wordCount > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg">
                  <span>Readability:</span>
                  <span className={`font-semibold ${readability.color}`}>{readability.label}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg">
                  <span>Reading Time:</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">~{stats.readingTime} sec</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/30 text-sm rounded-lg flex items-start gap-2 animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3 pb-1">
              <button
                onClick={handleClear}
                disabled={loading || !inputText}
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
              
              <button
                onClick={handleEnhance}
                disabled={loading || !inputText}
                className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Correct & Enhance
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Results */}
        <section className="lg:col-span-7 flex flex-col gap-6 scroll-mt-24" ref={resultsRef}>
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 min-h-[400px] transition-colors duration-200">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-indigo-300 dark:text-indigo-400/50" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Ready to Enhance</h3>
              <p className="max-w-xs">Enter your text on the left and let AI polish it into perfection.</p>
            </div>
          )}

          {loading && !result && (
             <div className="h-full flex flex-col gap-4 animate-pulse">
                <div className="h-40 bg-gray-200 dark:bg-gray-700/50 rounded-2xl w-full"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700/50 rounded-xl"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700/50 rounded-xl"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700/50 rounded-xl"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700/50 rounded-xl"></div>
                </div>
             </div>
          )}

          {result && (
            <>
              <div className="flex justify-between items-end mb-2">
                 <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">The Gold Standard</h3>
                 <button 
                  onClick={handleDownload}
                  className="text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                 >
                   <Download className="w-3.5 h-3.5" />
                   Download Report
                 </button>
              </div>

              {/* Primary Result */}
              <div className="animate-fade-in-up">
                <ResultCard
                  title="Corrected Version"
                  content={result.correctedText}
                  explanation="All grammar, spelling, and punctuation errors have been fixed."
                  variant="primary"
                  onUse={() => handleUseVariation(result.correctedText)}
                />
                
                {result.detectedIssues && result.detectedIssues.length > 0 && (
                  <div className="mt-3 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                    <span className="font-semibold">Fixed issues:</span> {result.detectedIssues.join(', ')}
                  </div>
                )}
              </div>

              {/* Variations */}
              <div className="animate-fade-in-up delay-100">
                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 mt-4">Stylistic Variations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.variations.map((item, index) => (
                    <ResultCard
                      key={index}
                      title={item.style}
                      content={item.text}
                      explanation={item.explanation}
                      iconType={item.style}
                      onUse={() => handleUseVariation(item.text)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
      `}</style>
    </div>
  );
};

export default App;