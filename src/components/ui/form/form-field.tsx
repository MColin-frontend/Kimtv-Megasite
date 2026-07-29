import type { FieldPath, FieldValues, UseControllerProps } from "react-hook-form"
import { Controller } from "react-hook-form"

import { Typography } from "@/components/ui/typography"

interface FormFieldProps<T extends FieldValues, N extends FieldPath<T>> extends UseControllerProps<
  T,
  N
> {
  label?: string
  required?: boolean
  render: (
    field: Parameters<Parameters<typeof Controller<T, N>>["0"]["render"]>[0]["field"]
  ) => React.ReactNode
}

export function FormField<T extends FieldValues, N extends FieldPath<T>>({
  label,
  required,
  render,
  ...controllerProps
}: FormFieldProps<T, N>) {
  const isDisabled = controllerProps.disabled
  return (
    <Controller
      {...controllerProps}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1.5">
          {label && (
            <Typography as="span" variant="body-sm" weight="500" className="text-white/80">
              {required && <span className="mr-0.5 text-red-400">*</span>}
              {label}
            </Typography>
          )}
          <div className={isDisabled ? "pointer-events-none select-none opacity-50" : undefined}>
            {render(field)}
          </div>
          {fieldState.error?.message && (
            <Typography variant="caption" className="text-red-400">
              {fieldState.error.message}
            </Typography>
          )}
        </div>
      )}
    />
  )
}
