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
        className="mt-2 w-full rounded-md border border-gi-line bg-white px-3 py-2 text-sm leading-6 text-gi-ink outline-none transition focus:border-gi-teal focus:ring-2 focus:ring-teal-100 aria-[invalid=true]:border-gi-rose aria-[invalid=true]:ring-rose-100"
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
