import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
    tags: string[];
    setTags: (tags: string[]) => void;
    placeholder: string;
    suggestions?: string[];
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags, placeholder, suggestions }) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            setTags(tags.slice(0, -1));
        }
    };

    const addTag = () => {
        const newTag = inputValue.trim();
        if (newTag && !tags.map(t => t.toLowerCase()).includes(newTag.toLowerCase())) {
            setTags([...tags, newTag]);
        }
        setInputValue('');
    };
    
    const addSuggestion = (suggestion: string) => {
        if (!tags.map(t => t.toLowerCase()).includes(suggestion.toLowerCase())) {
            setTags([...tags, suggestion]);
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };
    
    const unusedSuggestions = suggestions?.filter(s => !tags.includes(s)) || [];

    return (
        <div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-md p-2 flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-amber-500" onClick={() => inputRef.current?.focus()}>
                {tags.map(tag => (
                    <div key={tag} className="bg-amber-500/20 text-amber-300 text-sm font-medium px-2 py-1 rounded-md flex items-center gap-1.5">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-amber-300 hover:text-white" aria-label={`Remove ${tag}`}>
                            <X size={14}/>
                        </button>
                    </div>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="bg-transparent focus:outline-none flex-grow text-sm min-w-[120px]"
                />
            </div>
            {unusedSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {unusedSuggestions.map(suggestion => (
                        <button key={suggestion} onClick={() => addSuggestion(suggestion)} className="text-xs bg-zinc-700/50 text-zinc-400 px-2 py-1 rounded-md hover:bg-zinc-700 hover:text-zinc-200">
                            + {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagInput;
