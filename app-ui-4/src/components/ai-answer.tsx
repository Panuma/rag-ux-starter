import { ImageWithFallback } from "./figma/ImageWithFallback";
import Masonry from "react-responsive-masonry";

interface AIAnswerProps {
  content: {
    sections: {
      title?: string;
      paragraphs: string[];
    }[];
    images?: string[];
  };
}

export function AIAnswer({ content }: AIAnswerProps) {
  return (
    <div className="space-y-4">
      {/* Answer Header */}
      <h3 className="text-foreground">Инсайт</h3>

      {/* Main Content */}
      <div className="space-y-8">
        {content.sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            {section.title && (
              <h3 className="text-foreground">{section.title}</h3>
            )}
            <div className="space-y-4">
              {section.paragraphs.map((paragraph, pIdx) => (
                <p key={pIdx} className="text-foreground/80 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Visual Materials - Pinterest Style Masonry Layout */}
      {content.images && content.images.length > 0 && (
        <div className="space-y-6">
          <Masonry columnsCount={3} gutter="16px">
            {content.images.map((image, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-lg border border-border bg-muted/30 cursor-pointer transition-all duration-300 hover:border-border/60"
              >
                <ImageWithFallback
                  src={image}
                  alt={`Insight visual ${idx + 1}`}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </Masonry>
        </div>
      )}
    </div>
  );
}
