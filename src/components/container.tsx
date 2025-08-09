//make reusable container component
import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string; //optional one
}

const Container = ({ children, className, ...props }: ContainerProps) => {
  return (
    <div {...props} className={cn("container mx-auto px-4 md:px-8 py-4 w-full", className)}>
      {children}
    </div>
  );
};

export default Container;
