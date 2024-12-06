"use client";
import React, { useState, useEffect } from "react";
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
import { apiFetch } from "@/lib/api-fetch";
import { RoleCreateForm } from "@/components/Forms/PermsForms/RoleCreateForm";

interface Role {
  id: number;
  role: string;
}

async function fetchRoles() {
  try {
    const response = await apiFetch("/role/retrieve", { method: "POST" });
    if (!response.ok) {
      throw new Error("Failed to fetch roles");
    }
    const data = await response.json();
    return data as Role[];
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "An error occurred while fetching roles",
    );
  }
}

function RoleManagement() {
  const { toast } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setIsLoading(true);
        const fetchedRoles = await fetchRoles();
        setRoles(fetchedRoles);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load roles");
      } finally {
        setIsLoading(false);
      }
    };
    loadRoles();
  }, []);

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Toaster />
        <h1 className="mb-5 text-2xl font-bold">Role Management</h1>
        <div>Loading roles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Toaster />
        <h1 className="mb-5 text-2xl font-bold">Role Management</h1>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

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
            <RoleCreateForm />
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
          {roles?.map((role) => (
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
