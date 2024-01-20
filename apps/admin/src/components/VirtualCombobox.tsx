import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronsUpDown, X } from "lucide-react";
import * as React from "react";

type GenericOption<T> = T;

interface VirtualizedCommandProps<T> {
  height: string;
  elementHeight: number;
  options: GenericOption<T>[];
  placeholder: string;
  filter?: (option: GenericOption<T>, search: string) => boolean;
  selectedOptions: GenericOption<T>[];
  getOptionLabel: (option: GenericOption<T>) => React.ReactNode;
  getOptionValue: (option: GenericOption<T>) => string;
  onSelectOption?: (option: GenericOption<T>[]) => void;
}

const VirtualizedCommand = <T extends {}>({
  height,
  elementHeight,
  options,
  placeholder,
  filter,
  selectedOptions,
  getOptionLabel,
  getOptionValue,
  onSelectOption,
}: VirtualizedCommandProps<T>) => {
  const [filterValue, setFilterValue] = React.useState<string>("");
  const [filteredOptions, setFilteredOptions] =
    React.useState<GenericOption<T>[]>(options);
  const parentRef = React.useRef(null);

  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => elementHeight,
    overscan: 5,
  });

  const virtualOptions = virtualizer.getVirtualItems();

  const handleFilter = (search: string) => {
    if (!search) {
      setFilteredOptions(options);
      setFilterValue("");
      return;
    }
    if (!filter) {
      setFilteredOptions(
        options.filter((option) =>
          getOptionValue(option).toLowerCase().includes(search.toLowerCase()),
        ),
      );
      setFilterValue(search);
      return;
    }
    if (filter) {
      setFilteredOptions(options.filter((option) => filter(option, search)));
      setFilterValue(search);
      return;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
    }
  };

  return (
    <Command
      shouldFilter={false}
      onKeyDown={handleKeyDown}
      className={"w-full"}
    >
      <CommandInput
        onValueChange={handleFilter}
        value={filterValue}
        placeholder={placeholder}
      />
      <CommandEmpty>No item found.</CommandEmpty>
      <CommandGroup
        ref={parentRef}
        style={{
          height: height,
          width: "100%",
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualOptions.map((virtualRow) => (
            <CommandItem
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              key={virtualRow.key}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              value={getOptionValue(filteredOptions[virtualRow.index])}
              onSelect={() => {
                // if option is selected, then unselect it, otherwise select it and then return the selected options
                if (
                  selectedOptions
                    .map((x) => getOptionValue(x))
                    .includes(getOptionValue(filteredOptions[virtualRow.index]))
                ) {
                  onSelectOption?.(
                    selectedOptions.filter(
                      (x) =>
                        getOptionValue(x) !==
                        getOptionValue(filteredOptions[virtualRow.index]),
                    ),
                  );
                } else {
                  onSelectOption?.([
                    ...selectedOptions,
                    filteredOptions[virtualRow.index],
                  ]);
                }
              }}
            >
              {getOptionLabel(filteredOptions[virtualRow.index])}
            </CommandItem>
          ))}
        </div>
      </CommandGroup>
    </Command>
  );
};

interface VirtualizedComboboxProps<T> {
  options: GenericOption<T>[];
  selectedOptions: GenericOption<T>[];
  searchPlaceholder?: string;
  className?: string;
  height?: string;
  elementHeight?: number;
  multiple?: boolean;
  multipleLabel?: (options: GenericOption<T>) => React.ReactNode;
  filter?: (option: GenericOption<T>, search: string) => boolean;
  getOptionLabel: (option: GenericOption<T>) => React.ReactNode;
  getOptionValue: (option: GenericOption<T>) => string;
  onSelectOption: (option: GenericOption<T>[]) => void;
  isOpen?: boolean;
}

export function VirtualizedCombobox<T extends {}>({
  options,
  searchPlaceholder = "Search items...",
  selectedOptions,
  className = "w-full", // Default to full width using Tailwind
  height = "400px",
  elementHeight = 40,
  filter,
  getOptionLabel,
  getOptionValue,
  onSelectOption,
  multiple,
  multipleLabel,
  isOpen,
}: VirtualizedComboboxProps<T>) {
  const [open, setOpen] = React.useState<boolean>(isOpen ?? false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {multiple && (
        <div className="flex flex-wrap">
          {selectedOptions.map((option) => (
            <div key={getOptionValue(option)}>
              {multipleLabel?.(option)}
              <X
                className={"h-4 w-4 ml-2"}
                onClick={() => {
                  onSelectOption(
                    selectedOptions.filter(
                      (x) => getOptionValue(x) !== getOptionValue(option),
                    ),
                  );
                }}
              />
            </div>
          ))}
        </div>
      )}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`justify-between ${className}`} // Use Tailwind class for width
        >
          {!multiple && selectedOptions.length > 0
            ? getOptionLabel(selectedOptions[0])
            : "Select item..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]">
        <VirtualizedCommand
          filter={filter}
          elementHeight={elementHeight}
          height={height}
          options={options}
          getOptionLabel={getOptionLabel}
          getOptionValue={getOptionValue}
          placeholder={searchPlaceholder}
          onSelectOption={(currentValue) => {
            onSelectOption(currentValue);
            setOpen(false);
          }}
          selectedOptions={selectedOptions}
        />
      </PopoverContent>
    </Popover>
  );
}
