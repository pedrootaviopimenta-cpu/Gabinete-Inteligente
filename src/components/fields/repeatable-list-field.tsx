import { Plus, Trash2 } from "lucide-react";
import type { RepeatableListFieldDefinition } from "@/lib/forms";

type RepeatableListFieldProps = {
  field: RepeatableListFieldDefinition;
  value: string[];
  error?: string;
  onChange: (value: string[]) => void;
};

export function RepeatableListField({ field, value, error, onChange }: RepeatableListFieldProps) {
  const items = value.length ? value : [""];

  function updateItem(index: number, nextValue: string) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? nextValue : item)));
  }

  function addItem() {
    onChange([...items, ""]);
  }

  function removeItem(index: number) {
    const nextItems = items.filter((_, itemIndex) => itemIndex !== index);
    onChange(nextItems.length ? nextItems : [""]);
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gi-ink">
            {field.label}
            {field.required ? <span className="text-gi-rose"> *</span> : null}
          </p>
          {field.helpText ? <p className="mt-1 text-xs leading-5 text-gi-muted">{field.helpText}</p> : null}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="gi-button-secondary h-9 px-3"
        >
          <Plus className="h-4 w-4" aria-hidden={true} />
          {field.addLabel || "Adicionar item"}
        </button>
      </div>
      <div className="mt-3 grid gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              placeholder={field.placeholder || `Item ${index + 1}`}
              aria-invalid={Boolean(error)}
              onChange={(event) => updateItem(index, event.target.value)}
              className="gi-input mt-0 min-w-0 flex-1"
            />
            <button
              type="button"
              title="Remover item"
              onClick={() => removeItem(index)}
              className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-md border border-gi-line bg-white text-gi-muted transition hover:border-gi-rose hover:bg-rose-50 hover:text-gi-rose focus:outline-none focus:ring-2 focus:ring-gi-gold focus:ring-offset-2"
            >
              <Trash2 className="h-4 w-4" aria-hidden={true} />
            </button>
          </div>
        ))}
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-gi-rose">{error}</p> : null}
    </div>
  );
}
