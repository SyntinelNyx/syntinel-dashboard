import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RemovableBadge({
    label,
    onRemove,
}: {
    label: string;
    onRemove: () => void;
}) {
    return (
        <Badge className="flex items-center gap-1 px-2 py-1 rounded-full" variant="outline">
            <span>{label}</span>
            <button
                type="button"
                onClick={onRemove}
                className="ml-1 hover:text-red-500 focus:outline-none"
            >
                <X className="h-3 w-3" />
            </button>
        </Badge>
    );
}