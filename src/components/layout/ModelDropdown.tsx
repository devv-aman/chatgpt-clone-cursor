import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODEL_OPTIONS, CHAT_CONFIG } from "@/pages/Chat/constants";
import { STRINGS } from "@/constants/strings";

interface ModelDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelDropdown({ value, onChange }: ModelDropdownProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="h-8 w-auto gap-1.5 border-0 bg-transparent px-2 text-sm font-medium shadow-none hover:bg-accent focus:ring-0"
        aria-label={STRINGS.MODEL.SELECT_LABEL}
      >
        <SelectValue placeholder={CHAT_CONFIG.DEFAULT_MODEL} />
      </SelectTrigger>
      <SelectContent align="start">
        {MODEL_OPTIONS.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
