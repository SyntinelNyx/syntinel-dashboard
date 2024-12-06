"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api-fetch";
import { useToast } from "@/hooks/use-toast";

const RoleCreateFormSchema = z.object({
  role: z.string().min(1, "Role name cannot be empty"),
  is_administrator: z.boolean(),
  view_assets: z.boolean(),
  manage_assets: z.boolean(),
  view_modules: z.boolean(),
  create_modules: z.boolean(),
  manage_modules: z.boolean(),
  view_scans: z.boolean(),
  start_scans: z.boolean(),
});

export const RoleCreateForm = () => {
  const { toast } = useToast();

  const roleForm = useForm<z.infer<typeof RoleCreateFormSchema>>({
    resolver: zodResolver(RoleCreateFormSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = roleForm;
  const permissions = [
    { name: "view_assets", label: "View Assets" },
    { name: "manage_assets", label: "Manage Assets" },
    { name: "view_modules", label: "View Modules" },
    { name: "create_modules", label: "Create Modules" },
    { name: "manage_modules", label: "Manage Modules" },
    { name: "view_scans", label: "View Scans" },
    { name: "start_scans", label: "Start Scans" },
  ] as const;

  const handleAdminToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setValue("is_administrator", isChecked);
    permissions.forEach((permission) => {
      setValue(permission.name, isChecked, { shouldValidate: true });
    });
  };

  async function onSubmit(data: z.infer<typeof RoleCreateFormSchema>) {
    try {
      const response = await apiFetch("/role/create", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Creating Role Failed",
          description: await response.json(),
        });
        return;
      }

      toast({
        title: "Role Creation Successful",
        description: "Role Successfully Created",
      });

      window.location.reload();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An Unknown Error Has Occurred";

      toast({
        variant: "destructive",
        title: "Role Creation Failed",
        description: errorMessage,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="role" className="text-right">
            Role Name
          </label>
          <div className="col-span-3">
            <Input id="role" {...register("role")} required />
            <p className="text-sm text-red-500">{errors.role?.message}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center py-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register("is_administrator", {
              onChange: handleAdminToggle,
            })}
          />
          <span>Administrator</span>
        </label>
      </div>

      <div className="grid grid-cols-3 justify-center gap-4 py-4">
        {permissions.map(({ name, label }) => (
          <div key={name}>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register(
                  name as keyof z.infer<typeof RoleCreateFormSchema>,
                )}
              />
              {label}
            </label>
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button type="submit">Add Role</Button>
      </DialogFooter>
    </form>
  );
};
