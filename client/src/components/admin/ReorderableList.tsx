import { Reorder } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { FiMove } from "react-icons/fi";
import { cn } from "@/lib/cn";

interface ReorderableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Called once per completed drag with the full id list in its new order. */
  onCommit: (orderedIds: string[]) => void;
  /** Disables dragging while a previous reorder is still in flight. */
  pending?: boolean;
  className?: string;
}

/**
 * Drag-to-reorder list built on Framer Motion's `Reorder` primitives (no
 * extra drag-and-drop dependency — `dnd-kit` isn't installed and this
 * portfolio's admin lists are small/flat, well within what `Reorder` handles).
 * Local state gives instant visual feedback during the drag; the parent's
 * `onCommit` (→ `POST /:entity/reorder`) only fires once, on drag end.
 */
export function ReorderableList<T>({ items, getId, renderItem, onCommit, pending, className }: ReorderableListProps<T>) {
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  return (
    <Reorder.Group
      as="ul"
      axis="y"
      values={localItems}
      onReorder={setLocalItems}
      className={cn("flex flex-col gap-2", className)}
    >
      {localItems.map((item) => (
        <Reorder.Item
          as="li"
          key={getId(item)}
          value={item}
          drag={!pending}
          onDragEnd={() => onCommit(localItems.map(getId))}
          className={cn(
            "flex items-center gap-3 rounded-lg border border-base-700 bg-base-800/60 p-3",
            pending ? "cursor-wait opacity-70" : "cursor-grab active:cursor-grabbing"
          )}
        >
          <FiMove aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-base-500" />
          <div className="min-w-0 flex-1">{renderItem(item)}</div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
