import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
} from "../../ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

const DropdownItem = ({
  option,
  onClick,
}: {
  option: Option;
  onClick: () => void;
}) => (
  <DropdownMenuItem
    className="w-24 h-24 bg-gray-800 text-gray-200 rounded-md flex items-center justify-center"
    onClick={onClick}
  >
    <img src={option.image} alt={option.name} />
  </DropdownMenuItem>
);

type Option = { id: string; name: string; image: string; [key: string]: any };
type OptionId = Option["id"];

export const DropdownSelectPlaceholder: React.FC<{
  text?: string;
  image: string;
}> = ({ text, image }) => (
  <div className="relative">
    <img src={image} alt="Select Armour" className="grayscale brightness-50" />
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
}> = ({ defaultValue, options, placeholder, onSelect }) => {
  const [selected, setSelected] = useState<OptionId | null>(defaultValue);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-24 h-24 bg-gray-800 text-gray-200 rounded-md flex items-center justify-center">
        {selected ? (
          <img
            src={options.find((option) => option.id === selected)?.image}
            alt={options.find((option) => option.id === selected)?.name}
          />
        ) : (
          <span>{placeholder || "Select an option"}</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0 min-w-0 space-y-1">
        {options
          .filter((option) => option.id !== selected)
          .map((option) => (
            <DropdownItem
              key={option.id}
              option={option}
              onClick={() => {
                setSelected(option.id);
                onSelect && onSelect(option.id);
              }}
            />
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
