import { Lightbulb } from 'lucide-react';
import { EXAMPLE_PROMPTS } from '../types';

interface ExamplesProps {
  onSelectExample: (prompt: string) => void;
  disabled?: boolean;
}

export const Examples = ({ onSelectExample, disabled }: ExamplesProps) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        Example Prompts
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example.id}
            onClick={() => onSelectExample(example.prompt)}
            disabled={disabled}
            className="text-left p-4 rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-lg mb-1">{example.title}</div>
            <p className="text-xs text-gray-500 mb-2">{example.description}</p>
            <p className="text-sm text-gray-700 group-hover:text-primary-700 line-clamp-2">
              "{example.prompt}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
