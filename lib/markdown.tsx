import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export function Markdown({ content, poetry = false }: { content: string; poetry?: boolean }) {
  if (poetry) {
    return (
      <div className="poem-body">
        {content.split(/\n\s*\n/).map((stanza, index) => (
          <p key={index}>
            {stanza.split("\n").map((line, lineIndex) => (
              <span key={lineIndex}>
                {inline(line)}
                {lineIndex < stanza.split("\n").length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        ))}
      </div>
    );
  }

  const blocks = content.split(/\n\s*\n/);
  return (
    <div className="prose">
      {blocks.map((block, index) => {
        if (block.startsWith("### ")) return <h3 key={index}>{inline(block.slice(4))}</h3>;
        if (block.startsWith("## ")) return <h2 key={index}>{inline(block.slice(3))}</h2>;
        if (block.startsWith("# ")) return <h1 key={index}>{inline(block.slice(2))}</h1>;
        if (block.startsWith("- ")) {
          return (
            <ul key={index}>
              {block.split("\n").map((line) => <li key={line}>{inline(line.replace(/^- /, ""))}</li>)}
            </ul>
          );
        }
        return <p key={index}>{inline(block.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}
