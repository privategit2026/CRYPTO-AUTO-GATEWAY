import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  value: string;
  label: string;
}

const CopyButton = ({ value, label }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await navigator.clipboard?.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-200"
      onClick={handleCopy}
      type="button"
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
    </button>
  );
};

export default CopyButton;
