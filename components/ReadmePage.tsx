import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface ReadmePageProps {
  onBack: () => void;
}

const ReadmePage: React.FC<ReadmePageProps> = ({ onBack }) => {
  const [readmeText, setReadmeText] = useState('Lade Inhalt...');

  useEffect(() => {
    fetch('/README_APP.md')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(text => setReadmeText(text))
      .catch(error => {
        console.error('Error fetching README:', error);
        setReadmeText('Fehler beim Laden des Inhalts.');
      });
  }, []);

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center text-amber-400 hover:text-amber-300 mb-6 font-semibold">
        <ArrowLeft size={20} className="mr-2" />
        Zurück zur Hilfe
      </button>

      <article className="bg-zinc-950/50 border border-zinc-800 rounded-lg shadow-xl p-6 md:p-8">
        <div className="prose-styles">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {readmeText}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
};

export default ReadmePage;