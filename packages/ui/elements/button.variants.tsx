import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex w-fit items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        success: "bg-success text-success-foreground hover:bg-success/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive",
        outline:
          "border-[1.5px] border-input bg-transparent hover:bg-accent hover:text-accent-foreground ",
        muted: "bg-muted text-muted-foreground hover:bg-muted/90",
        subtle: "bg-transparent hover:text-secondary-foreground/70",
        ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
        link: "bg-transparent text-primary underline-offset-4 ring-transparent ring-offset-transparent hover:underline",
        tab: "",
      },

      size: {
        xs: "h-6 rounded-md px-1 py-1 text-xs",
        sm: "h-8 rounded-md px-2 py-1 text-sm",
        md: "h-10 px-4 py-2 text-sm md:text-md",
        lg: "h-11 rounded-md px-6 py-4 text-md md:px-8 md:py-6 md:text-lg",
      },

      selected: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "tab",
        selected: true,
        className: "bg-muted text-primary",
      },
      {
        variant: "tab",
        selected: false,
        className: "bg-muted/10 text-secondary-foreground ",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonVariants = typeof buttonVariants;

export { buttonVariants, type ButtonVariants };
