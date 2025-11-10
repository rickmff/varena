"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface TrollPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrollPopup({ isOpen, onClose }: TrollPopupProps) {
  const [closeAttempts, setCloseAttempts] = useState(0);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const previousPositionRef = useRef({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const MAX_ATTEMPTS = 5;
  const MIN_DISTANCE_FROM_PREVIOUS = 150; // Minimum distance from previous position in pixels

  // Initialize button position when popup opens
  useEffect(() => {
    if (isOpen) {
      // Start with button in top-right corner (will be set after first render)
      // We'll set it to top-right after getting dimensions
      setCloseAttempts(0);
    }
  }, [isOpen]);

  // Set initial position after popup dimensions are available
  useEffect(() => {
    if (isOpen && popupRef.current && buttonRef.current) {
      const popupRect = popupRef.current.getBoundingClientRect();
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const padding = 16;

      // Start in top-right corner
      const initialX = popupRect.width - buttonRect.width - padding;
      const initialY = padding;

      setButtonPosition({ x: initialX, y: initialY });
      previousPositionRef.current = { x: initialX, y: initialY };
    }
  }, [isOpen]);

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (closeAttempts < MAX_ATTEMPTS - 1) {
      // Get popup and button dimensions
      if (popupRef.current && buttonRef.current) {
        const popupRect = popupRef.current.getBoundingClientRect();
        const buttonRect = buttonRef.current.getBoundingClientRect();

        // Button is positioned using absolute left and top
        // Calculate bounds to keep button fully visible within popup
        const padding = 16;
        const buttonWidth = buttonRect.width;
        const buttonHeight = buttonRect.height;

        // X axis bounds: button can be anywhere horizontally within popup
        // left: 0 to (popup width - button width)
        const minX = padding; // Minimum left position (from left edge)
        const maxX = popupRect.width - buttonWidth - padding; // Maximum left position (from left edge)

        // Y axis bounds: button can be anywhere vertically within popup
        // top: 0 to (popup height - button height)
        const minY = padding; // Minimum top position (from top edge)
        const maxY = popupRect.height - buttonHeight - padding; // Maximum top position (from top edge)

        // Calculate center position
        const centerX = popupRect.width / 2 - buttonWidth / 2;
        const centerY = popupRect.height / 2 - buttonHeight / 2;

        // Generate random position biased toward center
        let newX: number, newY: number;
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loop

        do {
          // Use normal distribution biased toward center
          // This creates positions closer to center more often
          const randomFactorX = (Math.random() + Math.random() + Math.random()) / 3; // Bias toward 0.5
          const randomFactorY = (Math.random() + Math.random() + Math.random()) / 3;

          // Calculate position with center bias
          // More weight to center, less to edges
          const rangeX = maxX - minX;
          const rangeY = maxY - minY;

          // Position closer to center (weighted random)
          // Calculate range from center to nearest edge
          const rangeFromCenterX = Math.min(centerX - minX, maxX - centerX);
          const rangeFromCenterY = Math.min(centerY - minY, maxY - centerY);

          // Offset from center (0.6 factor keeps it closer to center)
          const offsetFromCenterX = (randomFactorX - 0.5) * rangeFromCenterX * 0.6;
          const offsetFromCenterY = (randomFactorY - 0.5) * rangeFromCenterY * 0.6;

          newX = centerX + offsetFromCenterX;
          newY = centerY + offsetFromCenterY;

          // Clamp to bounds to ensure button stays within popup
          newX = Math.max(minX, Math.min(maxX, newX));
          newY = Math.max(minY, Math.min(maxY, newY));

          attempts++;
        } while (
          attempts < maxAttempts &&
          Math.sqrt(
            Math.pow(newX - previousPositionRef.current.x, 2) +
            Math.pow(newY - previousPositionRef.current.y, 2)
          ) < MIN_DISTANCE_FROM_PREVIOUS
        );

        // Update position
        previousPositionRef.current = { x: newX, y: newY };
        setButtonPosition({ x: newX, y: newY });
        setCloseAttempts((prev) => prev + 1);
      }
    } else {
      // Final attempt - actually close
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center -pt-10">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Popup Content */}
      <div className="relative z-10 max-w-7xl w-full mx-4">
        <div
          ref={popupRef}
          className="relative bg-zinc-900 rounded-lg overflow-visible border border-zinc-700 shadow-2xl"
        >
          {/* Troll Image */}
          <div className="relative w-full aspect-video">
            <Image
              src="/images/trollform.png"
              alt="Troll Form"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Close Button - positioned absolutely */}
          <button
            ref={buttonRef}
            onClick={handleCloseClick}
            className="absolute rounded-full bg-red-600 hover:bg-red-700 text-white p-2 shadow-lg transition-all duration-300 ease-out z-20 cursor-pointer"
            style={{
              left: `${buttonPosition.x}px`,
              top: `${buttonPosition.y}px`,
            }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

