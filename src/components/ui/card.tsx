// Shadcn Card component placeholder
import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ children, ...props }: CardProps) {
  return (
    <div
      className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
      {...props}
    >
      {children}
    </div>
  );
}
