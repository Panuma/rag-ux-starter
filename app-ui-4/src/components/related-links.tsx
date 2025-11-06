import { Sparkles, ArrowRight } from "lucide-react";

interface RelatedLinksProps {
  links: {
    id: string;
    label: string;
    href: string;
  }[];
}

export function RelatedLinks({ links }: RelatedLinksProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <h3 className="text-foreground">Связанные</h3>

      {/* Links List */}
      <div className="space-y-0">
        {links.map((link, index) => (
          <div key={link.id}>
            <a
              href={link.href}
              className="flex items-start gap-3 group py-2"
            >
              <span className="text-muted-foreground mt-1 flex-shrink-0">↳</span>
              <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                {link.label}
              </span>
            </a>
            {index < links.length - 1 && (
              <div className="border-b border-border" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
