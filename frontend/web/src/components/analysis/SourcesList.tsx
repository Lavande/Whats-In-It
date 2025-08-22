import { ExternalLink, BookOpen } from "lucide-react";
import { Citation } from "@/types";
import Card from "@/components/ui/Card";

interface SourcesListProps {
  sources: Citation[];
}

export default function SourcesList({ sources }: SourcesListProps) {
  if (sources.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Sources & References
        </h3>
      </div>

      <div className="space-y-3">
        {sources.map((source, index) => (
          <div 
            key={index} 
            className="flex items-start space-x-3 p-3 bg-[var(--surface)] rounded-lg hover:bg-[var(--surface-variant)]/50 transition-colors"
          >
            <div className="flex-shrink-0 w-6 h-6 bg-[var(--primary-light)] rounded-full flex items-center justify-center text-xs font-medium text-[var(--primary-dark)]">
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {source.title}
              </p>
              
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-[var(--primary)] hover:text-[var(--primary-dark)] mt-1 hover:underline"
                >
                  <span>View Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-[var(--surface-variant)]">
        <p className="text-xs text-[var(--text-secondary)]">
          Analysis is based on current scientific research and may not reflect the latest findings. 
          Always consult healthcare providers for personalized advice.
        </p>
      </div>
    </Card>
  );
}