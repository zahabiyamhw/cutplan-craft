import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
    <div className="space-y-3 p-4 border rounded card">
      <div className="flex items-center justify-between">
        <Label className="font-semibold">Part {index + 1}</Label>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label htmlFor={`name-${index}`}>Name</Label>
          <Input
            id={`name-${index}`}
            value={part.name}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
            placeholder="Panel A"
          />
        </div>
        
        <div>
          <Label htmlFor={`width-${index}`}>Width</Label>
          <Input
            id={`width-${index}`}
            type="number"
            value={part.width}
            onChange={(e) => onUpdate(index, 'width', Number(e.target.value))}
            min="1"
          />
        </div>
        
        <div>
          <Label htmlFor={`height-${index}`}>Height</Label>
          <Input
            id={`height-${index}`}
            type="number"
            value={part.height}
            onChange={(e) => onUpdate(index, 'height', Number(e.target.value))}
            min="1"
          />
        </div>
        
        <div>
          <Label htmlFor={`quantity-${index}`}>Quantity</Label>
          <Input
            id={`quantity-${index}`}
            type="number"
            value={part.quantity}
            onChange={(e) => onUpdate(index, 'quantity', Number(e.target.value))}
            min="1"
          />
        </div>
        
        <div className="flex items-end">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`rotate-${index}`}
              checked={part.canRotate}
              onCheckedChange={(checked) => onUpdate(index, 'canRotate', checked)}
            />
            <Label htmlFor={`rotate-${index}`} className="text-sm font-normal">
              Can Rotate
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};
