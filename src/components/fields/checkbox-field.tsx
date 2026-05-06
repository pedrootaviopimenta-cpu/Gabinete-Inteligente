import type { CheckboxFieldDefinition } from "@/lib/forms";

type CheckboxFieldProps = {
  field: CheckboxFieldDefinition;
  value: boolean;
  error?: string;
  onChange: (value: boolean) => void;
};

export function CheckboxField({ field, value, error, onChange }: CheckboxFieldProps) {
  const id = `${field.name}-field`;

  return (
    <div>
      <label
        htmlFor={id}
        className="flex min-h-11 items-start gap-3 rounded-md border border-gi-line bg-white px-3 py-3 text-sm text-gi-ink transition focus-within:border-gi-gold focus-within:ring-2 focus-within:ring-gi-gold/20"
      >
        <input
          id={id}
          type="checkbox"
          checked={value}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gi-line text-gi-gold focus:ring-gi-gold"
        />
        <span>
          <span className="font-medium">
            {field.label}
            {field.required ? <span className="text-gi-rose"> *</span> : null}
          </span>
          {field.helpText ? <span className="mt-1 block text-xs leading-5 text-gi-muted">{field.helpText}</span> : null}
        </span>
      </label>
      {error ? <p className="mt-1 text-xs font-medium text-gi-rose">{error}</p> : null}
    </div>
  );
}
