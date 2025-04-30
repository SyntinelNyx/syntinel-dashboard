"use client";

import React, { useEffect, useState } from "react";
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
import { apiFetch } from "@/lib/api-fetch";
import { Pencil, Trash2, KeyRound } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { UserForm } from "@/components/Forms/PermsForms/UserForm";
import type { UserFormData } from "@/components/Forms/PermsForms/UserForm";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Role {
  id: string;
  role: string;
}

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [resetOpenMap, setResetOpenMap] = useState<Record<string, boolean>>({});
  const [deleteOpenMap, setDeleteOpenMap] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  const toggleReset = (id: string, open: boolean) =>
    setResetOpenMap((prev) => ({ ...prev, [id]: open }));
  const toggleDelete = (id: string, open: boolean) =>
    setDeleteOpenMap((prev) => ({ ...prev, [id]: open }));

  async function getUsers() {
    const res = await apiFetch("/user/retrieve");
    if (!res.ok) {
      setIsDisabled(true);
      throw new Error("Failed to fetch users");
    }
    return res.json();
  }

  async function getRoles() {
    const res = await apiFetch("/role/retrieve");
    if (!res.ok) {
      setIsDisabled(true);
      throw new Error("Failed to fetch roles");
    }
    return res.json();
  }

  async function HandleDelete(
    accountId: string,
    userName: string,
    toast: ReturnType<typeof useToast>["toast"],
    toggleDelete: (id: string, open: boolean) => void,
    refreshUsers: () => Promise<void>
  ) {
    try {
      const res = await apiFetch("/user/delete", {
        method: "POST",
        body: JSON.stringify({ account_id: accountId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }

      toast({
        title: "User Deleted",
        description: `${userName} has been removed.`,
        variant: "destructive",
      });

      toggleDelete(accountId, false);
      await refreshUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  }

  async function HandleUpdate(
    accountId: string,
    email: string,
    username: string,
    role_name: string,
    toast: ReturnType<typeof useToast>["toast"],
    onSuccess: () => Promise<void>
  ) {
    try {
      const res = await apiFetch("/user/update", {
        method: "POST",
        body: JSON.stringify({
          account_id: accountId,
          email,
          username,
          role_name,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update user");
      }

      toast({
        title: "User Updated",
        description: `${username} has been updated.`,
      });

      await onSuccess();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Could not update user",
        variant: "destructive",
      });
    }
  }


  useEffect(() => {
    async function loadUsers() {
      try {
        const [userData, roleData] = await Promise.all([getUsers(), getRoles()]);
        setUsers(userData ?? []);
        setRoles(roleData ?? []);
        setIsDisabled(false)
      } catch (error) {
        setIsDisabled(true);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load user/roles",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [toast]);

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Toaster />
        <h1 className="mb-5 text-2xl font-bold">User Management</h1>
        <div>Loading users...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Toaster />
      <h1 className="mb-5 text-2xl font-bold">User Management</h1>

      <div className="absolute right-0 top-0 m-12">
        {!isDisabled && (<TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={roles.length === 0}>Add New User</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>Enter the user details below.</DialogDescription>
                    </DialogHeader>
                    <UserForm roles={roles} onSubmitSuccess={() => setIsAddUserOpen(false)} />
                  </DialogContent>
                </Dialog>
              </span>
            </TooltipTrigger>
            {roles.length === 0 && (
              <TooltipContent>Please add a role first</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit User</TooltipContent>
                      </Tooltip>

                      <Popover
                        open={resetOpenMap[user.id] ?? false}
                        onOpenChange={(open) => toggleReset(user.id, open)}
                        modal={true}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="icon">
                                <KeyRound className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Send Reset Link</TooltipContent>
                        </Tooltip>
                        <PopoverContent className="w-64" side="top" align="center">
                          <span className="mb-4 text-sm">
                            Send password reset link to <strong>{user.email}</strong>?
                          </span>
                          <div className="flex justify-between items-center mt-4 w-full">
                            <Button variant="outline" size="sm" onClick={() => toggleReset(user.id, false)}>
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  const res = await apiFetch("/user/send-reset-link", {
                                    method: "POST",
                                    body: JSON.stringify({ email: user.email }),
                                  });
                                  if (!res.ok) throw new Error("Failed to send reset link");

                                  toast({
                                    title: "Reset Link Sent",
                                    description: `Password reset link sent to ${user.email}`,
                                  });
                                  toggleReset(user.id, false);
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description:
                                      error instanceof Error ? error.message : "Failed to send reset link",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              Send Link
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Popover
                        open={deleteOpenMap[user.id] ?? false}
                        onOpenChange={(open) => toggleDelete(user.id, open)}
                        modal={true}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Delete User</TooltipContent>
                        </Tooltip>
                        <PopoverContent className="w-64" side="top" align="center">
                          <span className="mb-4 text-sm">
                            Are you sure you want to delete <strong>{user.name}</strong>? This action
                            cannot be undone.
                          </span>
                          <div className="flex justify-between items-center mt-4 w-full">
                            <Button variant="outline" size="sm" onClick={() => toggleDelete(user.id, false)}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                HandleDelete(user.id, user.name, toast, toggleDelete, async () => {
                                  const refreshedUsers = await getUsers();
                                  setUsers(refreshedUsers ?? []);
                                })
                              }
                            >
                              Delete
                            </Button>

                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center italic text-muted-foreground">
                There are currently no users.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the user&apos;s details below.</DialogDescription>
          </DialogHeader>
          {editingUser ? (
            <UserForm
              roles={roles}
              isEditing
              defaultValues={{
                username: editingUser.name,
                email: editingUser.email,
                role_name: editingUser.role,
              }}
              onSubmitSuccess={async (formData: UserFormData) => {
                if (!editingUser) return;

                await HandleUpdate(
                  editingUser.id,
                  formData.email,
                  formData.username,
                  formData.role_name,
                  toast,
                  async () => {
                    setIsEditDialogOpen(false);
                    setEditingUser(null);
                    const refreshedUsers = await getUsers();
                    setUsers(refreshedUsers ?? []);
                  }
                );
              }}
              accountId={editingUser.id}
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
  return <UserManagement />;
}
