import { useState } from "react";
import { ConfigPanel } from "@/components/ConfigPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { usePyodide } from "@/hooks/usePyodide";
import { getPythonScript } from "@/lib/pythonScript";
import { useToast } from "@/hooks/use-toast";
import { Part } from "@/components/PartInput";

const Index = () => {
  const { pyodide, loading: pyodideLoading, error: pyodideError } = usePyodide();
  const { toast } = useToast();
  const [parts, setParts] = useState<Part[]>([
    { name: "Panel A", width: 300, height: 500, quantity: 4, canRotate: true },
    { name: "Panel B", width: 200, height: 400, quantity: 3, canRotate: true },
    { name: "Panel C", width: 100, height: 100, quantity: 4, canRotate: false },
  ]);
  const [sheetWidth, setSheetWidth] = useState(1000);
  const [sheetHeight, setSheetHeight] = useState(1000);
  const [kerf, setKerf] = useState(5);
  const [allowRotations, setAllowRotations] = useState(true);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!pyodide) {
      toast({
        title: "Python engine not ready",
        description: "Please wait for the Python engine to load.",
        variant: "destructive",
      });
      return;
    }

    if (parts.length === 0) {
      toast({
        title: "No parts defined",
        description: "Please add at least one part to optimize.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      pyodide.runPython(getPythonScript());
      
      const partsJson = JSON.stringify(parts);
      const result = pyodide.runPython(`
import json
parts_data = json.loads('''${partsJson}''')
result = run_optimizer(parts_data, ${sheetWidth}, ${sheetHeight}, ${kerf}, ${allowRotations ? 'True' : 'False'}, time_limit=10.0)
result if result else ""
      `);

      if (result) {
        setSvgContent(result);
        toast({
          title: "Layout generated",
          description: "Cutting layout has been optimized successfully.",
        });
      } else {
        toast({
          title: "Optimization failed",
          description: "Could not generate a valid layout. Try adjusting parameters.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating layout:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate layout",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen flex">
      <div className="w-[450px] flex-shrink-0">
        <ConfigPanel
          parts={parts}
          setParts={setParts}
          sheetWidth={sheetWidth}
          setSheetWidth={setSheetWidth}
          sheetHeight={sheetHeight}
          setSheetHeight={setSheetHeight}
          kerf={kerf}
          setKerf={setKerf}
          allowRotations={allowRotations}
          setAllowRotations={setAllowRotations}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      </div>
      <div className="flex-1">
        <OutputPanel
          svgContent={svgContent}
          isGenerating={isGenerating}
          pyodideLoading={pyodideLoading}
          pyodideError={pyodideError}
        />
      </div>
    </div>
  );
};

export default Index;
