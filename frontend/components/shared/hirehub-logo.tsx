interface HireHubLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function HireHubLogo({ size = "md", showText = true, className = "" }: HireHubLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 bg-hirehub-gradient rounded-lg flex items-center justify-center">
          <div className="w-3/4 h-3/4 relative">
            {/* Geometric circles and lines representing network/connections */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-full bg-white opacity-60"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-white opacity-60"></div>
          </div>
        </div>
      </div>

      {showText && (
        <span className={`font-heading font-bold text-hirehub-gradient ${textSizeClasses[size]}`}>HireHub</span>
      )}
    </div>
  )
}
