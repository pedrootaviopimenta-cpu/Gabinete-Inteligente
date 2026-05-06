import type { SelectFieldDefinition } from "@/lib/forms";

type SelectFieldProps = {
  field: SelectFieldDefinition;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function SelectField({ field, value, error, onChange }: SelectFieldProps) {
  const id = `${field.name}-field`;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-gi-ink">
        {field.label}
        {field.required ? <span className="text-gi-rose"> *</span> : null}
      </label>
      {field.helpText ? <p className="mt-1 text-xs leading-5 text-gi-muted">{field.helpText}</p> : null}
      <select
        id={id}
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className="gi-input"
      >
        <option value="">{field.placeholder || "Selecione"}</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs font-medium text-gi-rose">{error}</p> : null}
    </div>
  );
}
