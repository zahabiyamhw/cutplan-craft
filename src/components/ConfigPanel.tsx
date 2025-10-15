import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { PartInput, Part } from "./PartInput";

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
    <div className="h-full flex flex-col border-r">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">Cut List Optimizer</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your cutting parameters
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sheet Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow-rotations"
                  checked={allowRotations}
                  onCheckedChange={(checked) => setAllowRotations(checked as boolean)}
                />
                <Label htmlFor="allow-rotations" className="font-normal">
                  Allow rotations (overall)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Parts</CardTitle>
                <Button onClick={addPart} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Part
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {parts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
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

      <div className="p-6 border-t">
        <Button
          onClick={onGenerate}
          disabled={isGenerating || parts.length === 0}
          className="w-full"
          size="lg"
        >
          {isGenerating ? "Generating..." : "Generate Cutting Layout"}
        </Button>
      </div>
    </div>
  );
};
