import * as React from "react"
import './label.css'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`label-text ${className}`}
        {...props}
      />
    )
  }
)
Label.displayName = "Label"

export { Label }
