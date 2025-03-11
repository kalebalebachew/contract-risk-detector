export function Alert({ children, className, ...props }) {
    return (
      <div className={`rounded-lg p-4 ${className}`} {...props}>
        {children}
      </div>
    )
  }
  
  