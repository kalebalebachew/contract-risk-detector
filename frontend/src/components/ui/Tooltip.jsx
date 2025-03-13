import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export function Tooltip({ children, content }) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          className="bg-gray-800 text-white text-sm rounded-md p-2 shadow-lg"
          sideOffset={5}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-gray-800" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}