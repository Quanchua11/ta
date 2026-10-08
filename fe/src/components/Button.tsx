import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'primary' | 'secondary' | 'ghost' | 'danger'
  children: ReactNode
}

export function Button({ variant = 'outline', className = '', children, ...props }: ButtonProps) {
  const variantClass = variant === 'danger' ? 'button-outline danger-action' : `button-${variant}`

  return (
    <button className={`button ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  )
}
