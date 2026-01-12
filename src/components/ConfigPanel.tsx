import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { PartInput, Part } from "./PartInput";
import "./ConfigPanel.css";

interface ConfigPanelProps {
  parts: Part[];
  setParts: (parts: Part[]) => void;
  sheetWidth: number;
  setSheetWidth: (width: number) => void;
  sheetHeight: number;
  setSheetHeight: (height: number) => void;
  kerf: number;
  setKerf: (kerf: number) => void;
  allowRotations: boolean;
  setAllowRotations: (allow: boolean) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ConfigPanel = ({
  parts,
  setParts,
  sheetWidth,
  setSheetWidth,
  sheetHeight,
  setSheetHeight,
  kerf,
  setKerf,
  allowRotations,
  setAllowRotations,
  onGenerate,
  isGenerating,
}: ConfigPanelProps) => {
  const addPart = () => {
    setParts([
      ...parts,
      {
        name: `Part ${parts.length + 1}`,
        width: 100,
        height: 100,
        quantity: 1,
        canRotate: true,
      },
    ]);
  };

  const updatePart = (index: number, field: keyof Part, value: any) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setParts(newParts);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  return (
    <div className="config-panel">
      <div className="config-header">
        <h2 className="config-title">UTuff - Cut Optimizer</h2>
        <p className="config-subtitle">
          Configure your cutting parameters
        </p>
      </div>

      <ScrollArea className="config-scroll">
        <div className="config-content">
          <Card>
            <CardHeader>
              <CardTitle className="card-title">Sheet Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="sheet-dimensions">
              <div className="sheet-grid">
                <div>
                  <Label htmlFor="sheet-width">Width</Label>
                  <Input
                    id="sheet-width"
                    type="number"
                    value={sheetWidth}
                    onChange={(e) => setSheetWidth(Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="sheet-height">Height</Label>
                  <Input
                    id="sheet-height"
                    type="number"
                    value={sheetHeight}
                    onChange={(e) => setSheetHeight(Number(e.target.value))}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="kerf">Kerf (blade width)</Label>
                <Input
                  id="kerf"
                  type="number"
                  value={kerf}
                  onChange={(e) => setKerf(Number(e.target.value))}
                  min="0"
                />
              </div>

              <div className="allow-rotations-row">
                <Checkbox
                  id="allow-rotations"
                  checked={allowRotations}
                  onCheckedChange={(checked) => setAllowRotations(checked as boolean)}
                />
                <Label htmlFor="allow-rotations" className="allow-rotations-label">
                  Allow rotations (overall)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="parts-header">
                <CardTitle className="card-title">Parts</CardTitle>
                <Button onClick={addPart} size="sm" variant="outline" className="add-part-btn">
                  <Plus className="add-part-icon" />
                  Add Part
                </Button>
              </div>
            </CardHeader>
            <CardContent className="parts-content">
              {parts.length === 0 ? (
                <p className="no-parts">
                  No parts added. Click "Add Part" to get started.
                </p>
              ) : (
                parts.map((part, index) => (
                  <PartInput
                    key={index}
                    part={part}
                    index={index}
                    onUpdate={updatePart}
                    onRemove={removePart}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      <div className="generate-btn-row">
        <Button
          onClick={onGenerate}
          disabled={isGenerating || parts.length === 0}
          className="generate-btn"
          size="lg"
        >
          {isGenerating ? "Generating..." : "Generate Cutting Layout"}
        </Button>
      </div>
    </div>
  );
};
