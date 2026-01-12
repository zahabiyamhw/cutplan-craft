import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import "./ConfigPanel.css";

export interface Part {
  name: string;
  width: number;
  height: number;
  quantity: number;
  canRotate: boolean;
}

interface PartInputProps {
  part: Part;
  index: number;
  onUpdate: (index: number, field: keyof Part, value: any) => void;
  onRemove: (index: number) => void;
}

export const PartInput = ({ part, index, onUpdate, onRemove }: PartInputProps) => {
  return (
    <div className="part-input-card">
      <div className="part-input-header">
        <Label className="part-input-title">Part {index + 1}</Label>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="part-input-remove-btn"
        >
          <Trash2 className="part-input-remove-icon" />
        </Button>
      </div>

      <div className="part-input-grid">
        <div className="part-input-name">
          <Label htmlFor={`name-${index}`}>Name</Label>
          <Input
            id={`name-${index}`}
            value={part.name}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
            placeholder="Panel A"
          />
        </div>

        <div className="part-input-width">
          <Label htmlFor={`width-${index}`}>Width</Label>
          <Input
            id={`width-${index}`}
            type="number"
            value={part.width}
            onChange={(e) => onUpdate(index, 'width', Number(e.target.value))}
            min="1"
          />
        </div>

        <div className="part-input-height">
          <Label htmlFor={`height-${index}`}>Height</Label>
          <Input
            id={`height-${index}`}
            type="number"
            value={part.height}
            onChange={(e) => onUpdate(index, 'height', Number(e.target.value))}
            min="1"
          />
        </div>

        <div className="part-input-quantity">
          <Label htmlFor={`quantity-${index}`}>Quantity</Label>
          <Input
            id={`quantity-${index}`}
            type="number"
            value={part.quantity}
            onChange={(e) => onUpdate(index, 'quantity', Number(e.target.value))}
            min="1"
          />
        </div>

        <div className="part-input-rotate-row">
          <div className="part-input-rotate">
            <Checkbox
              id={`rotate-${index}`}
              checked={part.canRotate}
              onCheckedChange={(checked) => onUpdate(index, 'canRotate', checked)}
            />
            <Label htmlFor={`rotate-${index}`} className="part-input-rotate-label">
              Can Rotate
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};
