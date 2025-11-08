import React, { useState, KeyboardEvent, useId } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder: string;
  suggestions?: string[];
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags, placeholder, suggestions }) => {
  const [inputValue, setInputValue] = useState('');
  const suggestionsId = useId();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-md p-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-[var(--color-accent-500)]">
      {tags.map(tag => (
        <div key={tag} className="bg-zinc-700 text-zinc-200 rounded-md px-2 py-1 flex items-center gap-1.5 text-sm">
          <span>{tag}</span>
          <button onClick={() => removeTag(tag)} className="text-zinc-400 hover:text-white" aria-label={`Entferne ${tag}`}>
            <X size={14} />
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-transparent focus:outline-none flex-grow text-sm min-w-[120px]"
        list={suggestionsId}
        autoComplete="off"
      />
      {suggestions && (
        <datalist id={suggestionsId}>
          {suggestions.filter(s => !tags.includes(s)).map(suggestion => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      )}
    </div>
  );
};

export default TagInput;