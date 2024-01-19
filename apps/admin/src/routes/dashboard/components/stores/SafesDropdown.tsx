import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/components/utils";
import { useState } from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

export const SafesDropdown = (props: {
  safes: { value: string; label: string }[];
  onChange?: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? props.safes.find((safe) => safe.value === value)?.label
            : "Select a wallet to receive payments"}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search wallet..." className="h-9" />
          <CommandEmpty>No wallet found.</CommandEmpty>
          <CommandGroup>
            {props.safes.map((safe) => (
              <CommandItem
                key={safe.value}
                value={safe.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                  props.onChange?.(currentValue);
                }}
              >
                {safe.label}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === safe.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
