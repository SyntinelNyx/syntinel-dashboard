import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-fetch";


interface NoteDialogCellProps {
    initialNote: string;
    scanID: string;
}

export function NoteDialogCell({ initialNote, scanID }: NoteDialogCellProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [note, setNote] = useState(initialNote);
    const [tempNote, setTempNote] = useState(initialNote);
    const [isSaving, setIsSaving] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        setNote(initialNote);
        setTempNote(initialNote);
    }, [initialNote]);

    const handleEditClick = () => {
        setTempNote(note);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempNote(note);
        setIsDialogOpen(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await apiFetch("/scan/update-notes", {
                method: "POST",
                body: JSON.stringify({
                    scan_id: scanID,
                    notes: tempNote,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save note");
            }

            const data = await response.json();
            console.log("Save success:", data);

            setNote(tempNote);
            setIsEditing(false);
            setIsDialogOpen(false);

            toast({
                title: "Note updated!",
                description: "The note was successfully saved.",
                variant: "default",
            });
        } catch (error) {
            console.error("Error saving note:", error);
            toast({
                title: "Error",
                description: "Failed to save the note. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex space-x-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>View Note</DialogTitle>
                        <DialogDescription>You can view or edit the note here.</DialogDescription>
                    </DialogHeader>

                    <hr className="my-4" />

                    <div className="grid gap-4 py-2">
                        {!isEditing ? (
                            <p className="text-sm text-muted-foreground">{note || "No note yet."}</p>
                        ) : (
                            <textarea
                                id="edit-note"
                                name="note"
                                value={tempNote}
                                onChange={(e) => setTempNote(e.target.value)}
                                rows={5}
                                className="w-full border p-2 rounded-md"
                                disabled={isSaving}
                            />
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>
                            Cancel
                        </Button>
                        {!isEditing ? (
                            <Button onClick={handleEditClick}>Edit</Button>
                        ) : (
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
