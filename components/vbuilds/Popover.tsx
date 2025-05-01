"use client";

interface PopoverProps {
  title: string;
  description: string;
  img?: string;
  isVisible: boolean;
}

export function Popover({ title, description, img, isVisible }: PopoverProps) {
  if (!isVisible) return null;

  return;

  return (
    <div className="absolute z-10 p-4 bg-black text-white rounded shadow-lg w-64">
      <div className="flex items-center">
        {img && (
          <img
            src={img}
            alt={title}
            className="w-12 h-12 mb-2 object-contain"
          />
        )}
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="text-sm">{description}</p>
    </div>
  );
}
