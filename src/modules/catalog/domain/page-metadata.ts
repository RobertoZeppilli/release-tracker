// What the Technology page says about itself to a search engine. The Catalog description is a few
// words, too short to read as a result on its own, so it is followed by what the page actually
// holds: the Releases, and a Summary for the ones that have one. Nothing here claims more.
export type TechnologyMeta = { title: string; description: string };

export function technologyMeta(technology: { name: string; description: string }): TechnologyMeta {
  const holds = `Every ${technology.name} release, with a summary of what changed when there is one.`;
  const described = technology.description.trim();
  return {
    title: `${technology.name} releases`,
    description: described ? `${sentence(described)} ${holds}` : holds,
  };
}

function sentence(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}
