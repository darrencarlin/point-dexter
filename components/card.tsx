import { cn } from "@/lib/utils";

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const classname = cn(
    "p-4 border rounded-lg shadow-sm bg-card border-foreground/10 shadow-sm",
    className
  );

  return <div className={classname}>{children}</div>;
};
