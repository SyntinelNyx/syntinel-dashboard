import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
        </button>
    );
}
