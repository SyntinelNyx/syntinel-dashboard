import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ViewScanButton({ id }: { id: string }) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/dashboard/scans/view/${id}`);
    };

    return (
        <Button variant="outline" size="icon" onClick={handleClick}>
            <Eye className="h-4 w-4" />
        </Button>
    );
}
