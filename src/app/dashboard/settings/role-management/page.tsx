"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Pencil, Trash2 } from "lucide-react";
import { RoleCreateForm } from "@/components/Forms/PermsForms/RoleCreateForm";

interface Role {
  id: number;
  role: string;
}

const initialRoles: Role[] = [
  { id: 1, role: "Maintainer" },
  { id: 2, role: "Editor" }
];

function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { toast } = useToast();

  const handleEditRole = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingRole) return;
    const formData = new FormData(event.currentTarget);
    const updatedRole: Role = {
      id: editingRole.id,
      role: formData.get("role") as string,
    };
    setRoles(
      roles.map((role) => (role.id === updatedRole.id ? updatedRole : role)),
    );
    setEditingRole(null);
    toast({
      title: "Role Updated",
      description: `${updatedRole.role}'s permissions have been updated.`,
    });
  };

  const handleDeleteRole = (roleId: number) => {
    setRoles(roles.filter((role) => role.id !== roleId));
    toast({
      title: "Role Deleted",
      description: "The role has been removed from the system.",
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Toaster />
      <h1 className="mb-5 text-2xl font-bold">Role Management</h1>
      <div className="mb-4">
        <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
          <DialogTrigger asChild>
            <Button className="absolute right-0 top-0 m-12">
              Add New Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <RoleCreateForm setIsAddRoleOpen={setIsAddRoleOpen}/>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.role}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingRole(role)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>
                          Make changes to the role's here.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleEditRole}>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-role" className="text-right">
                            Role
                          </Label>
                          <Input
                            id="edit-role"
                            name="role"
                            defaultValue={editingRole?.role}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteRole(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ManagementPage() {
  return <RoleManagement />;
}