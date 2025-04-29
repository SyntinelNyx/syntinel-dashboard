import { useState } from "react";
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

interface NoteDialogCellProps {
    initialNote: string;
}

export function NoteDialogCell({ initialNote }: NoteDialogCellProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [note, setNote] = useState(initialNote);
    const [tempNote, setTempNote] = useState(initialNote);

    const handleEditClick = () => {
        setTempNote(note);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempNote(note);
        setIsDialogOpen(false);
    };

    const handleSave = () => {
        setNote(tempNote);
        setIsEditing(false);
        setIsDialogOpen(false);
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
                            <p className="text-sm text-muted-foreground">{note}</p>
                        ) : (
                            <textarea
                                id="edit-note"
                                name="note"
                                value={tempNote}
                                onChange={(e) => setTempNote(e.target.value)}
                                rows={5}
                                className="w-full border p-2 rounded-md"
                            />
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        {!isEditing ? (
                            <Button onClick={handleEditClick}>Edit</Button>
                        ) : (
                            <Button onClick={handleSave}>Save</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
