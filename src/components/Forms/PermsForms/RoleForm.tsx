import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api-fetch";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

const permissionTemplates = [
  { name: "Overview", options: ["View"] },
  { name: "Assets", options: ["View", "Create", "Manage"] },
  { name: "Vulnerabilities", options: ["View", "Manage"] },
  { name: "Environments", options: ["View", "Create", "Manage"] },
  { name: "Actions", options: ["View", "Create", "Manage"] },
  { name: "Snapshots", options: ["View", "Create", "Manage"] },
  { name: "Scans", options: ["View", "Create", "Manage"] },
  { name: "UserManagement", options: ["View", "Create", "Manage"] },
  { name: "RoleManagement", options: ["View"] },
  { name: "ApplicationConfig", options: ["View", "Manage"] },
  { name: "Logs", options: ["View"] },
] as const;

const RoleFormSchema = z.object({
  role: z.string().min(1, "Role name cannot be empty"),
  permissionLevels: z.record(z.string(), z.string()),
});

interface RoleFormProps {
  defaultValues?: {
    role: string;
    permissions: string[];
  };
  allRoles?: string[];
  onSubmitSuccess?: () => void;
  isEditing?: boolean;
}

export const RoleForm = ({ defaultValues, onSubmitSuccess, isEditing = false, allRoles = [] }: RoleFormProps) => {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof RoleFormSchema>>({
    resolver: zodResolver(RoleFormSchema),
    defaultValues: {
      role: defaultValues?.role ?? "",
      permissionLevels: convertPermissionsArrayToRecord(defaultValues?.permissions ?? []),
    },
  });

  useEffect(() => {
    if (defaultValues) {
      const permissionRecord = convertPermissionsArrayToRecord(defaultValues.permissions);

      reset({
        role: defaultValues.role,
        permissionLevels: permissionRecord,
      });

      const isAdminDefaults = permissionTemplates.every((perm) => {
        const highestLevel = perm.options[perm.options.length - 1];
        return permissionRecord[perm.name] === highestLevel;
      });

      setIsAdmin(isAdminDefaults);

      console.log(defaultValues)
    }
  }, [defaultValues, reset]);

  const permissionLevels = watch("permissionLevels");

  useEffect(() => {
    if (isAdmin) {
      const updated: Record<string, string> = {};
      permissionTemplates.forEach((perm) => {
        updated[perm.name] = perm.options[perm.options.length - 1];
      });
      setValue("permissionLevels", updated, { shouldValidate: true });
    }

  }, [isAdmin, isEditing, setValue]);


  const handlePermissionChange = (component: string, value: string) => {
    setValue(`permissionLevels.${component}`, value, { shouldValidate: true });
  };

  async function onSubmit(data: z.infer<typeof RoleFormSchema>) {
    const permissions = Object.entries(data.permissionLevels)
      .filter(([, level]) => level !== "None")
      .map(([component, level]) => `${component}.${level}`);

    if (!isEditing && allRoles.includes(data.role.trim())) {
      toast({
        variant: "destructive",
        title: "Role Already Exists",
        description: `A role named "${data.role}" already exists.`,
      });
      return;
    }

    const endpoint = isEditing ? "/role/update" : "/role/create";

    const payload = {
      role: data.role,
      permissions,
      ...(isEditing && defaultValues ? { prevRole: defaultValues.role } : {}),
    };

    try {
      const response = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: isEditing ? "Updating Role Failed" : "Creating Role Failed",
          description: await response.json(),
        });
        return;
      }

      toast({
        title: isEditing ? "Role Updated" : "Role Created",
        description: `Role ${data.role} was ${isEditing ? "updated" : "created"} successfully.`,
      });

      if (onSubmitSuccess) onSubmitSuccess();

      window.location.reload();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Role Submission Failed",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  function convertPermissionsArrayToRecord(arr: string[]): Record<string, string> {
    const out: Record<string, string> = {};
    arr.forEach((perm) => {
      const [component, capability] = perm.split(".");
      if (component && capability) out[component] = capability;
    });
    return out;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-4 items-center gap-4 mt-8">
        <label htmlFor="role" className="text-right">Role Name</label>
        <div className="col-span-3">
          <Input
            id="role"
            placeholder={"Enter role name"}
            {...register("role")}
            defaultValue={isEditing ? "" : undefined}
            autoFocus={false}
          />
          <p className="text-sm text-red-500">{errors.role?.message}</p>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4 py-2">
        <label htmlFor="admin" className="text-right">Administrator</label>
        <Switch id="admin" checked={isAdmin} onCheckedChange={setIsAdmin} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {permissionTemplates.map((perm) => (
          <div key={perm.name} className="flex flex-col items-start space-y-1">
            <label className="text-sm font-medium text-right">{perm.name}</label>
            <Select
              disabled={isAdmin}
              onValueChange={(val) => handlePermissionChange(perm.name, val)}
              value={permissionLevels[perm.name] || "None"}
            >
              <SelectTrigger className="w-full min-w-[140px] max-w-[160px]">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                {perm.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button type="submit">{isEditing ? "Save Changes" : "Add Role"}</Button>
      </DialogFooter>
    </form>
  );
};