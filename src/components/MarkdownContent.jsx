import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownContent({ content, className = '' }) {
  return (
    <div className={`prose prose-amber max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling optimized for posts
          h1: ({node, ...props}) => <h1 className="text-xl font-bold text-amber-900 mb-2 mt-1" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold text-amber-900 mb-2 mt-1" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base font-semibold text-amber-900 mb-1 mt-1" {...props} />,
          p: ({node, ...props}) => <p className="text-amber-900 mb-2 leading-[1.7]" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-amber-950" {...props} />,
          em: ({node, ...props}) => <em className="italic" {...props} />,
          code: ({node, inline, ...props}) => 
            inline 
              ? <code className="px-1 py-0.5 bg-amber-100/60 rounded text-amber-900 text-sm font-mono" {...props} />
              : <code className="block p-2 bg-amber-100/60 rounded text-sm overflow-x-auto font-mono my-2" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-3 border-amber-400 pl-3 italic text-amber-800 my-2" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 text-amber-900 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 text-amber-900 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
          a: ({node, ...props}) => <a className="text-amber-600 hover:text-amber-700 underline decoration-amber-400 hover:decoration-amber-600 transition" target="_blank" rel="noopener noreferrer" {...props} />,
          hr: ({node, ...props}) => <hr className="border-amber-300 my-3" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
