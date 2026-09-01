interface EditorPaneProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}

export function EditorPane({ value, onChange, placeholder }: EditorPaneProps) {
  return (
    <textarea
      className={`
        w-full h-full min-h-[500px] resize-none outline-none bg-transparent 
        font-serif text-lg leading-relaxed text-foreground/80 placeholder-foreground/30
      `}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck={false}
    />
  );
}
