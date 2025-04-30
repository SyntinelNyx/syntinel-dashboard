"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Pencil, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RoleForm } from "@/components/Forms/PermsForms/RoleForm";

interface Role {
  id: number;
  role: string;
  permissions: string[];
}

async function fetchRoles(): Promise<Role[]> {
  const response = await apiFetch("/role/retrieve", { method: "GET" });
  if (!response.ok) throw new Error("Failed to fetch roles");
  const data = await response.json();
  return data ?? [];
}

async function fetchRoleDetails(roleId: number): Promise<Role> {
  const response = await apiFetch(`/role/retrieve-data/${roleId}`, {
    method: "GET",
  });
  if (!response.ok) throw new Error("Failed to fetch role details");
  return response.json();
}

async function deleteRole(roleName: string) {
  const response = await apiFetch("/role/delete", {
    method: "POST",
    body: JSON.stringify({ role_name: roleName }),
  });
  if (!response.ok) throw new Error("Failed to delete role");
  return true;
}

function RoleManagement() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setIsLoading(true);
        const fetchedRoles = await fetchRoles();
        setRoles(fetchedRoles);
        setIsDisabled(false);
      } catch (error) {
        setIsDisabled(true);
        toast({
          title: "Error",
          description: `Failed to load roles: ${error}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadRoles();
  }, [toast]);

  const handleDeleteRole = async (roleName: string) => {
    try {
      const success = await deleteRole(roleName);
      if (success) {
        setRoles(roles.filter((role) => role.role !== roleName));
        toast({
          title: "Role Deleted",
          description: "The role has been deleted.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete role: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleEditClick = async (roleId: number) => {
    try {
      const fullRole = await fetchRoleDetails(roleId);
      setEditingRole(fullRole);
      setIsEditDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to edit role: ${error}`,
        variant: "destructive",
      });
    }
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


  return (
    <div className="container mx-auto py-10">
      <Toaster />
      <h1 className="mb-5 text-2xl font-bold">Role Management</h1>

      <div className="mb-4">
        {!isDisabled && (<Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
          <DialogTrigger asChild>
            <Button className="absolute right-0 top-0 m-12">Add New Role</Button>
          </DialogTrigger>
          <DialogContent>
            <RoleForm onSubmitSuccess={() => setIsAddRoleOpen(false)} allRoles={roles.map((r) => r.role)} />
          </DialogContent>
        </Dialog>)}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center italic text-muted-foreground">
                There are currently no roles.
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.role}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(role.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Popover
                      open={openPopoverId === role.id}
                      onOpenChange={(open: boolean) => setOpenPopoverId(open ? role.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-64"
                        side="top"
                        align="center"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        <span className="mb-4 text-sm">
                          Are you sure you want to delete the role <strong>{role.role}</strong>? This action cannot be undone.
                        </span>
                        <div className="flex justify-between items-center mt-4 w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenPopoverId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              handleDeleteRole(role.role);
                              setOpenPopoverId(null);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Make changes to the role&apos;s permissions here.
            </DialogDescription>
          </DialogHeader>
          {editingRole ? (
            <RoleForm
              key={editingRole.id}
              isEditing
              defaultValues={{
                role: editingRole.role,
                permissions: editingRole.permissions,
              }}
              onSubmitSuccess={() => {
                setEditingRole(null);
                setIsEditDialogOpen(false);
              }}
            />
          ) : (
            <div>Loading...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ManagementPage() {
  return <RoleManagement />;
}
