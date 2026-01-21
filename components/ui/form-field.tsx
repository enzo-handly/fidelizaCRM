"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface BaseFormFieldProps {
  id: string
  label: string
  required?: boolean
  className?: string
  error?: string
}

interface FormFieldInputProps extends BaseFormFieldProps {
  type?: "text" | "email" | "number" | "tel" | "url" | "password"
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

interface FormFieldTextareaProps extends BaseFormFieldProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  rows?: number
}

type FormFieldProps = FormFieldInputProps | FormFieldTextareaProps

function isTextareaProps(props: FormFieldProps): props is FormFieldTextareaProps {
  return "rows" in props
}

export function FormField(props: FormFieldProps) {
  const { id, label, required, className, error } = props

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && " *"}
      </Label>
      {isTextareaProps(props) ? (
        <Textarea
          id={id}
          placeholder={props.placeholder}
          required={required}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          rows={props.rows}
          className={error ? "border-destructive" : ""}
        />
      ) : (
        <Input
          id={id}
          type={props.type || "text"}
          placeholder={props.placeholder}
          required={required}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className={error ? "border-destructive" : ""}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
