import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface OutputPanelProps {
  svgContent: string | null;
  isGenerating: boolean;
  pyodideLoading: boolean;
  pyodideError: string | null;
}

export const OutputPanel = ({
  svgContent,
  isGenerating,
  pyodideLoading,
  pyodideError,
}: OutputPanelProps) => {
  if (pyodideError) {
    return (
      <div className="output-error-container">
        <Card className="output-error-card">
          <h3 className="output-error-title">
            Error Loading Python Engine
          </h3>
          <p className="output-error-message">{pyodideError}</p>
        </Card>
      </div>
    );
  }

  if (pyodideLoading) {
    return (
      <div className="output-loading-container">
        <div className="output-loading-content">
          <Loader2 className="output-loader" />
          <div>
            <p className="output-loading-title">Loading Python Engine...</p>
            <p className="output-loading-subtitle">
              This may take a moment on first load
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="output-generating-container">
        <div className="output-generating-content">
          <Loader2 className="output-loader" />
          <div>
            <p className="output-generating-title">Generating Layout...</p>
            <p className="output-generating-subtitle">
              Optimizing cuts and placement
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className="output-empty-container">
        <div className="output-empty-content">
          <div className="output-empty-icon">📐</div>
          <h3 className="output-empty-title">No Layout Generated</h3>
          <p className="output-empty-message">
            Configure your parts and sheet dimensions on the left, then click
            "Generate Cutting Layout" to see the optimized result here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="output-svg-container">
      <Card className="output-svg-card">
        <div dangerouslySetInnerHTML={{ __html: svgContent }} />
      </Card>
    </div>
  );
};
