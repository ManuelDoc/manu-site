import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:brightness-110",
        destructive: "bg-destructive text-foreground hover:brightness-110",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        hero: "bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.97]",
        heroOutline: "border border-border bg-transparent text-foreground hover:bg-secondary active:scale-[0.97]",
        link: "text-primary underline-offset-4 hover:underline",
        navCta: "bg-nav-button text-foreground hover:bg-nav-button/80 active:scale-[0.97] transition-all",
        outline: "border border-border bg-transparent hover:bg-secondary hover:text-secondary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        icon: "h-10 w-10",
        lg: "h-11 px-8",
        sm: "h-9 rounded-md px-3",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return <Comp className={cn(buttonVariants({ className, size, variant }))} ref={ref} {...props} />;
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
