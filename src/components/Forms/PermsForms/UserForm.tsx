"use client";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api-fetch";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

export interface UserFormData {
    username: string;
    email: string;
    role_name: string;
}

interface UserFormProps {
    roles: { id: string; role: string }[];
    onSubmitSuccess?: (formData: UserFormData) => void;
    defaultValues?: UserFormData;
    isEditing?: boolean;
    accountId?: string;
}

// Schemas
const createSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    role_name: z.string().min(1, "Role is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const editSchema = createSchema.omit({ password: true });

type CreateFormSchema = z.infer<typeof createSchema>;
type EditFormSchema = z.infer<typeof editSchema>;

export const UserForm = ({
    roles,
    onSubmitSuccess,
    defaultValues,
    isEditing = false,
    accountId = "",
}: UserFormProps) => {
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);

    const schema = isEditing ? editSchema : createSchema;

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<EditFormSchema | CreateFormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            username: defaultValues?.username || "",
            email: defaultValues?.email || "",
            role_name: defaultValues?.role_name || "",
            ...(isEditing ? {} : { password: "" }),
        },
    });

    useEffect(() => {
        if (defaultValues) {
            reset({
                username: defaultValues.username,
                email: defaultValues.email,
                role_name: defaultValues.role_name,
                ...(isEditing ? {} : { password: "" }),
            });
        }
    }, [defaultValues, reset, isEditing]);

    const onSubmit = async (data: CreateFormSchema | EditFormSchema) => {
        try {
            const endpoint = isEditing ? "/user/update" : "/user/create";
            const payload = isEditing
                ? {
                    account_id: accountId,
                    email: data.email,
                    username: data.username,
                    role_name: data.role_name,
                }
                : {
                    email: data.email,
                    username: data.username,
                    password: (data as CreateFormSchema).password,
                    role_name: data.role_name,
                };

            const res = await apiFetch(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to submit user");

            toast({
                title: isEditing ? "User Updated" : "User Created",
                description: `${data.username} was ${isEditing ? "updated" : "added"} successfully.`,
            });

            onSubmitSuccess?.({
                username: data.username,
                email: data.email,
                role_name: data.role_name,
            });

            if (!isEditing) window.location.reload();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to submit user",
                variant: "destructive",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="space-y-2">
                <label htmlFor="username">Username</label>
                <Input id="username" {...register("username")} />
                <p className="text-sm text-red-500">{errors.username?.message}</p>
            </div>

            <div className="space-y-2">
                <label htmlFor="email">Email</label>
                <Input id="email" type="email" {...register("email")} />
                <p className="text-sm text-red-500">{errors.email?.message}</p>
            </div>

            {!isEditing && (
                <div className="space-y-2">
                    <label htmlFor="password">Password</label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            {...register("password" as const)}
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    <p className="text-sm text-red-500">
                        {(errors as { password?: { message?: string } }).password?.message}
                    </p>
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="role_name">Role</label>
                <Controller
                    name="role_name"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.role}>
                                        {role.role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                <p className="text-sm text-red-500">{errors.role_name?.message}</p>
            </div>

            <DialogFooter>
                <Button type="submit">{isEditing ? "Save Changes" : "Add User"}</Button>
            </DialogFooter>
        </form>
    );

};
