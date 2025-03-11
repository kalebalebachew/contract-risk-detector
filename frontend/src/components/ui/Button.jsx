export function Button({ children, className, ...props }) {
    return (
      <button className={`inline-flex items-center justify-center ${className}`} {...props}>
        {children}
      </button>
    )
  }
  
  