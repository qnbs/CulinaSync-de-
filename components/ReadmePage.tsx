import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface ReadmePageProps {
  onBack: () => void;
}

const ReadmePage: React.FC<ReadmePageProps> = ({ onBack }) => {
  const [readmeContent, setReadmeContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        const response = await fetch('/README.md');
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        setReadmeContent(text);
      } catch (error) {
        console.error('Failed to fetch README.md:', error);
        setReadmeContent('Fehler beim Laden der README-Datei.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReadme();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-8">Lade README...</div>;
    }
    
    // Simple Markdown to HTML renderer
    let html = readmeContent;

    // Escape HTML to prevent XSS, then selectively un-escape our generated tags
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Block elements
    html = html.replace(/&lt;div align="center"&gt;([\s\S]*?)&lt;\/div&gt;/gs, '<div class="text-center my-6">$1</div>');
    html = html.replace(/&lt;img src="(.*?)" alt="(.*?)" width="(\d+)"&gt;/g, '<div class="flex justify-center my-6"><img src="$1" alt="$2" width="$3" class="bg-zinc-800 p-1 rounded-lg" /></div>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold text-amber-400 mt-2 mb-6">$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-zinc-100 mt-10 mb-4 border-b border-zinc-700 pb-2">$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-zinc-200 mt-8 mb-3">$1</h3>');
    html = html.replace(/^---$/gm, '<hr class="border-zinc-700 my-8" />');
    html = html.replace(/```bash\n([\s\S]*?)```/g, '<pre class="bg-zinc-900 text-zinc-300 p-4 rounded-md overflow-x-auto text-sm my-4 border border-zinc-700"><code>$1</code></pre>');
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-zinc-900 text-zinc-300 p-4 rounded-md overflow-x-auto text-sm my-4 border border-zinc-700"><code>$1</code></pre>');

    // Table
    html = html.replace(/\|(.*)\|\n\|(.*)\|\n((?:\|.*\|\n?)*)/g, (match, header, separator, body) => {
        if (!separator.includes('---')) return `|${header}|\n|${separator}|\n${body}`;

        const thead = `<thead><tr class="border-b-2 border-zinc-600">${header.split('|').slice(1, -1).map(h => `<th class="py-2 px-4 text-left text-amber-400 font-semibold">${h.trim()}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${body.trim().split('\n').map(row => `<tr class="border-b border-zinc-800">${row.split('|').slice(1, -1).map(c => `<td class="py-3 px-4">${c.trim().replace(/✅/g, '<span class="text-green-400">✅</span>')}</td>`).join('')}</tr>`).join('')}</tbody>`;
        return `<div class="overflow-x-auto my-6"><table class="w-full min-w-[600px] text-left border-collapse">${thead}${tbody}</table></div>`;
    });
    
    // Lists
    html = html.replace(/^\s*[-*] (.*)/gm, '<li>$1</li>');
    html = html.replace(/(<\/li>\n<li>)/g, '</li><li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="list-disc pl-6 space-y-2 my-4">$1</ul>');

    // Inline elements
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code class="bg-zinc-700 text-amber-300 rounded px-1.5 py-0.5 font-mono text-sm mx-1">$1</code>');

    // Paragraphs for remaining text blocks
    html = html.split('\n\n').map(p => {
        if (p.trim().startsWith('&lt;') || p.trim().startsWith('<') || p.trim() === '') return p;
        return `<p class="leading-relaxed text-zinc-300">${p}</p>`;
    }).join('');

    // Final newline to br conversion
    html = html.replace(/\n/g, '<br />');

    return <div className="prose-styles" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center text-amber-400 hover:text-amber-300 mb-6 font-semibold">
        <ArrowLeft size={20} className="mr-2" />
        Zurück zur Hilfe
      </button>

      <article className="bg-zinc-950/50 border border-zinc-800 rounded-lg shadow-xl p-6 md:p-8">
        {renderContent()}
      </article>
    </div>
  );
};

export default ReadmePage;
