import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownEditor({ value, onChange, placeholder, maxLength = 2000, className = '' }) {
  const [isPreview, setIsPreview] = useState(false);

  const insertMarkdown = (before, after = '') => {
    const textarea = document.getElementById('markdown-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange({ target: { value: newText } });
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const toolbarButtons = [
    { label: 'B', title: 'Bold', action: () => insertMarkdown('**', '**') },
    { label: 'I', title: 'Italic', action: () => insertMarkdown('*', '*') },
    { label: 'H', title: 'Heading', action: () => insertMarkdown('### ') },
    { label: '•', title: 'Bullet List', action: () => insertMarkdown('- ') },
    { label: '1.', title: 'Numbered List', action: () => insertMarkdown('1. ') },
    { label: '"', title: 'Quote', action: () => insertMarkdown('> ') },
    { label: '<>', title: 'Code', action: () => insertMarkdown('`', '`') },
    { label: 'Link', title: 'Link', action: () => insertMarkdown('[', '](url)') },
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 bg-amber-100/40 rounded-t-xl border border-amber-300/50 border-b-0">
        <div className="flex items-center gap-1 flex-wrap">
          {toolbarButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              onClick={btn.action}
              className="px-2 py-1 text-xs rounded bg-white hover:bg-amber-50 border border-amber-200 text-amber-900 transition font-semibold"
              title={btn.title}
            >
              {btn.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`px-3 py-1 text-xs rounded transition font-semibold ${
              isPreview 
                ? 'bg-amber-600 text-white' 
                : 'bg-white hover:bg-amber-50 border border-amber-200 text-amber-900'
            }`}
          >
            {isPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Editor/Preview */}
      {!isPreview ? (
        <div className="relative">
          <textarea
            id="markdown-textarea"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full min-h-[120px] resize-y rounded-b-xl border-2 border-amber-300 border-t-0 bg-white p-3 text-[15px] leading-[1.7] font-serif outline-none focus:ring-2 focus:ring-amber-400"
            style={{ fontFamily: "'Crimson Text', 'Georgia', 'Times New Roman', serif" }}
          />
          <div className="absolute bottom-2 right-2 text-xs text-amber-700/60 bg-white/80 px-2 py-1 rounded">
            {value.length}/{maxLength}
          </div>
        </div>
      ) : (
        <div className="min-h-[120px] rounded-b-xl border-2 border-amber-300 border-t-0 bg-white p-4 prose prose-amber max-w-none overflow-auto">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom styling for markdown elements
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-amber-900 mb-2" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold text-amber-900 mb-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-amber-900 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="text-amber-800 mb-2 leading-relaxed" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-amber-900" {...props} />,
              em: ({node, ...props}) => <em className="italic text-amber-800" {...props} />,
              code: ({node, inline, ...props}) => 
                inline 
                  ? <code className="px-1.5 py-0.5 bg-amber-100 rounded text-amber-900 text-sm" {...props} />
                  : <code className="block p-2 bg-amber-100 rounded text-sm overflow-x-auto" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-400 pl-4 italic text-amber-700" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 text-amber-800" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 text-amber-800" {...props} />,
              a: ({node, ...props}) => <a className="text-amber-600 hover:text-amber-700 underline" {...props} />,
            }}
          >
            {value || '*No content to preview*'}
          </ReactMarkdown>
        </div>
      )}

      {/* Help text */}
      <div className="text-xs text-amber-700/60 px-2">
        Supports **bold**, *italic*, ### headings, - lists, {'>'} quotes, `code`, and [links](url)
      </div>
    </div>
  );
}
