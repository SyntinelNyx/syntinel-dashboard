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

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const initialUsers: User[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "User" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "User" },
  { id: 4, name: "Diana Prince", email: "diana@example.com", role: "Manager" },
  { id: 5, name: "Ethan Hunt", email: "ethan@example.com", role: "Admin" },
  { id: 6, name: "Fiona Gallagher", email: "fiona@example.com", role: "User" },
  {
    id: 7,
    name: "George Weasley",
    email: "george@example.com",
    role: "Editor",
  },
  { id: 8, name: "Hannah Abbott", email: "hannah@example.com", role: "User" },
  { id: 9, name: "Ian Fleming", email: "ian@example.com", role: "Author" },
  { id: 10, name: "Jane Austen", email: "jane@example.com", role: "Manager" },
  { id: 11, name: "Kyle Reese", email: "kyle@example.com", role: "Admin" },
  { id: 12, name: "Luna Lovegood", email: "luna@example.com", role: "User" },
  {
    id: 13,
    name: "Michael Scott",
    email: "michael@example.com",
    role: "Manager",
  },
  { id: 14, name: "Nancy Drew", email: "nancy@example.com", role: "Detective" },
  { id: 15, name: "Oscar Wilde", email: "oscar@example.com", role: "Author" },
  { id: 16, name: "Pam Beesly", email: "pam@example.com", role: "User" },
  {
    id: 17,
    name: "Quentin Tarantino",
    email: "quentin@example.com",
    role: "Director",
  },
  { id: 18, name: "Rachel Green", email: "rachel@example.com", role: "User" },
  { id: 19, name: "Steve Rogers", email: "steve@example.com", role: "Manager" },
  { id: 20, name: "Tony Stark", email: "tony@example.com", role: "Admin" },
];

function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleAddUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newUser: User = {
      id: users.length + 1,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
    };
    setUsers([...users, newUser]);
    setIsAddUserOpen(false);
    toast({
      title: "User Added",
      description: `${newUser.name} has been added successfully.`,
    });
  };

  const handleEditUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(event.currentTarget);
    const updatedUser: User = {
      id: editingUser.id,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
    };
    setUsers(
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    );
    setEditingUser(null);
    toast({
      title: "User Updated",
      description: `${updatedUser.name}'s information has been updated.`,
    });
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId));
    toast({
      title: "User Deleted",
      description: "The user has been removed from the system.",
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Toaster />
      <h1 className="mb-5 text-2xl font-bold">User Management</h1>
      <div className="mb-4">
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="absolute right-0 top-0 m-12">
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Enter the details of the new user here.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Input
                    id="role"
                    name="role"
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                          Make changes to the user's information here.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleEditUser}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">
                              Name
                            </Label>
                            <Input
                              id="edit-name"
                              name="name"
                              defaultValue={editingUser?.name}
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-email" className="text-right">
                              Email
                            </Label>
                            <Input
                              id="edit-email"
                              name="email"
                              type="email"
                              defaultValue={editingUser?.email}
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-role" className="text-right">
                              Role
                            </Label>
                            <Input
                              id="edit-role"
                              name="role"
                              defaultValue={editingUser?.role}
                              className="col-span-3"
                              required
                            />
                          </div>
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
                    onClick={() => handleDeleteUser(user.id)}
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
  return <UserManagement />;
}
