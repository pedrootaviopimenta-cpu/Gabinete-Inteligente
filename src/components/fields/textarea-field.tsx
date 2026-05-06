import type { TextareaFieldDefinition } from "@/lib/forms";

type TextareaFieldProps = {
  field: TextareaFieldDefinition;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function TextareaField({ field, value, error, onChange }: TextareaFieldProps) {
  const id = `${field.name}-field`;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-gi-ink">
        {field.label}
        {field.required ? <span className="text-gi-rose"> *</span> : null}
      </label>
      {field.helpText ? <p className="mt-1 text-xs leading-5 text-gi-muted">{field.helpText}</p> : null}
      <textarea
        id={id}
        value={value}
        rows={field.rows || 4}
        placeholder={field.placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className="gi-input resize-y"
      />
      {error ? <p className="mt-1 text-xs font-medium text-gi-rose">{error}</p> : null}
    </div>
  );
}
