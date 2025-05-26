import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

const string1 =
  "bg-black/80 backdrop-blur-sm border-2 border-red-900/30 hover:border-red-500 transition-all duration-300 overflow-hidden group block h-full relative";
const string2 =
  "border-red-900/50 bg-gradient-to-b to-red-900/20 from-transparent";
const string3 =
  "bg-zinc-900 border-2 border-transparent hover:border-purple-500 transition-all duration-100";

const DropdownItem = ({
  option,
  onClick,
}: {
  option: Option | ClearOption;
  onClick: () => void;
}) => (
  <DropdownMenuItem
    className={`w-20 h-20 text-gray-200 rounded-md flex items-center justify-center ${string3}`}
    onClick={onClick}
  >
    {option.label ? (
      <span className="absolute inset-0 flex items-center justify-center text-white">
        {option.label}
      </span>
    ) : (
      <img
        src={option.image}
        alt={option.name}
        className="pointer-events-none"
      />
    )}
  </DropdownMenuItem>
);

type ClearOption = { label: string; image?: string; name?: string };
type Option = { id: string; name: string; image: string; [key: string]: any };
type OptionId = Option["id"];

export const DropdownSelectPlaceholder: React.FC<{
  text?: string;
  image: string;
}> = ({ text, image }) => (
  <div className="relative">
    <img
      src={image}
      alt="Select Armour"
      className="grayscale brightness-50 pointer-events-none opacity-60"
    />
    <span className="absolute inset-0 flex items-center justify-center text-white">
      {text}
    </span>
  </div>
);

export const DropdownSelect: React.FC<{
  options: Option[];
  defaultValue: OptionId | null;
  placeholder?: any;
  onSelect?: (id: OptionId) => void;
  clear?: () => void;
  selected: OptionId;
}> = ({ defaultValue, options, placeholder, onSelect, clear, selected }) => {
  // const [selected, setSelected] = useState<OptionId | null>(defaultValue);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`w-20 h-20 text-gray-200 rounded-md flex items-center justify-center ${string3}`}
      >
        {selected ? (
          <img
            src={options.find((option) => option.id === selected)?.image}
            alt={options.find((option) => option.id === selected)?.name}
            className="pointer-events-none"
          />
        ) : (
          <span>{placeholder || "Select an option"}</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0 min-w-0 space-y-1 overflow-auto">
        <div className="flex flex-wrap gap-2 p-2">
          {options
            .filter((option) => option.id !== selected)
            .map((option) => (
              <DropdownItem
                key={option.id}
                option={option}
                onClick={() => {
                  // setSelected(option.id);
                  onSelect && onSelect(option.id);
                }}
              />
            ))}
          {selected && clear && (
            <DropdownItem
              option={{
                label: "Clear",
              }}
              onClick={() => {
                clear();
              }}
            />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
