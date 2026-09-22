// The prompt asks for code in backticks: odd segments of the split are code spans.
export function InlineCode({ text }: { text: string }) {
  const parts = text.split("`");
  // An unpaired backtick is shown as written rather than opening a span that never closes.
  if (parts.length % 2 === 0) return text;
  return parts.map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : part));
}
