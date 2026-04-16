export function generateMockIdeas(topic) {
  const raw = String(topic || "").trim();
  if (!raw) return [];

  const words = raw
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean)
    .slice(0, 6);

  const seed = words.join(" ");
  const tagSet = new Set(words.slice(0, 4));
  const tags = Array.from(tagSet);

  const formats = [
    "10 Strategies",
    "Beginner's Guide",
    "Best Practices",
    "Common Mistakes",
    "Step-by-Step Plan",
  ];

  const ideaTemplates = formats.map((f, idx) => {
    const focus = words[idx % Math.max(words.length, 1)] || "creator";
    const title = `${f} for ${raw}`;
    const description = `A practical draft about ${raw}: cover key concepts, include actionable examples, and outline next steps for ${focus}.`;
    const extraTags = idx % 2 === 0 ? ["draft"] : ["workflow"];
    return {
      title,
      description,
      tags: Array.from(new Set([...tags, ...extraTags])).slice(0, 6),
    };
  });

  return ideaTemplates;
}

