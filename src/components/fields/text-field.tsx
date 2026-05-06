import type { TextFieldDefinition } from "@/lib/forms";

type TextFieldProps = {
  field: TextFieldDefinition;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function TextField({ field, value, error, onChange }: TextFieldProps) {
  const id = `${field.name}-field`;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-gi-ink">
        {field.label}
        {field.required ? <span className="text-gi-rose"> *</span> : null}
      </label>
      {field.helpText ? <p className="mt-1 text-xs leading-5 text-gi-muted">{field.helpText}</p> : null}
      <input
        id={id}
        type="text"
        value={value}
        placeholder={field.placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className="gi-input"
      />
      {error ? <p className="mt-1 text-xs font-medium text-gi-rose">{error}</p> : null}
    </div>
  );
}
