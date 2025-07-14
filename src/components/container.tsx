//make reusable container component
import {cn} from "@/lib/utils";


interface ContainerProps {
    children: React.ReactNode;
    className?: string; //optional one
}

const Container = ({children,className}:ContainerProps) => {
  return (
    <div className={cn("container mx-auto px-4 md:px-8 py-2 w-full", className)}>
      {children}
    </div>
  )
}

export default Container
