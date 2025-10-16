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
      <div className="h-full flex items-center justify-center p-6">
        <Card className="p-6 max-w-md">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Error Loading Python Engine
          </h3>
          <p className="text-sm text-muted-foreground">{pyodideError}</p>
        </Card>
      </div>
    );
  }

  if (pyodideLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div>
            <p className="text-lg font-medium">Loading Python Engine...</p>
            <p className="text-sm text-muted-foreground">
              This may take a moment on first load
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div>
            <p className="text-lg font-medium">Generating Layout...</p>
            <p className="text-sm text-muted-foreground">
              Optimizing cuts and placement
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-3">
          <div className="text-6xl mb-4">📐</div>
          <h3 className="text-xl font-semibold">No Layout Generated</h3>
          <p className="text-sm text-muted-foreground">
            Configure your parts and sheet dimensions on the left, then click
            "Generate Cutting Layout" to see the optimized result here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 bg-muted-30">
      <Card className="inline-block min-w-full p-4">
        <div dangerouslySetInnerHTML={{ __html: svgContent }} />
      </Card>
    </div>
  );
};
