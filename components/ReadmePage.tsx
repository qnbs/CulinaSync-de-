import React from 'react';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import readmeText from '../README_APP.md?raw';

interface ReadmePageProps {
  onBack: () => void;
}

const ReadmePage: React.FC<ReadmePageProps> = ({ onBack }) => {
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