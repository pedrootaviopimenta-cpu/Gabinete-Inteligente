import type { CheckboxGroupFieldDefinition } from "@/lib/forms";

type CheckboxGroupFieldProps = {
  field: CheckboxGroupFieldDefinition;
  value: string[];
  error?: string;
  onChange: (value: string[]) => void;
};

export function CheckboxGroupField({ field, value, error, onChange }: CheckboxGroupFieldProps) {
  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
      return;
    }

    onChange([...value, optionValue]);
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium text-gi-ink">
        {field.label}
        {field.required ? <span className="text-gi-rose"> *</span> : null}
      </legend>
      {field.helpText ? <p className="mt-1 text-xs leading-5 text-gi-muted">{field.helpText}</p> : null}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {field.options.map((option) => (
          <label
            key={option.value}
            className="flex min-h-10 items-center gap-3 rounded-md border border-gi-line bg-white px-3 py-2 text-sm text-gi-ink"
          >
            <input
              type="checkbox"
              checked={value.includes(option.value)}
              onChange={() => toggle(option.value)}
              className="h-4 w-4 rounded border-gi-line text-gi-teal focus:ring-gi-teal"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-gi-rose">{error}</p> : null}
    </fieldset>
  );
}
