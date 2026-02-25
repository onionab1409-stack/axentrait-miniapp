import { Chip } from '../ui/Chip';

type QuickPromptChipsProps = {
  prompts: string[];
  onSelect: (prompt: string) => void;
};

export function QuickPromptChips({ prompts, onSelect }: QuickPromptChipsProps) {
  return (
    <div className="ax-row" style={{ gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
      {prompts.map((prompt) => (
        <Chip key={prompt} onClick={() => onSelect(prompt)}>
          {prompt}
        </Chip>
      ))}
    </div>
  );
}
