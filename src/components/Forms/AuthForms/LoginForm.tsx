"use client";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const LoginFormSchema = z.object({
  account_type: z.enum(["root", "iam"], {
    errorMap: () => ({ message: "You must select a user type." }),
  }),
  username: z.string().min(1, {
    message: "Username cannot be empty.",
  }),
  password: z.string().min(1, {
    message: "Password cannot be empty.",
  }),
});

export const LoginForm = () => {
  const router = useRouter();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      account_type: "root",
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof LoginFormSchema>) {
    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          account_type: data.account_type,
          username: data.username,
          password: data.password,
        }),
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: await response.json(),
        });
        return;
      }

      toast({
        title: "Login Successful",
        description: "Successfully Logged In",
      });
      router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An Unknown Error Has Occurred";

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    }
  }

  return (
    <Card>
      <CardHeader className="-mb-2 text-center text-2xl">
        <CardTitle>Login</CardTitle>
        <CardDescription>Login as a root user or an IAM user.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Form {...loginForm}>
          <form
            onSubmit={loginForm.handleSubmit(onSubmit)}
            className="flex flex-col space-y-6"
          >
            <FormField
              control={loginForm.control}
              name="account_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="root">Root Account</SelectItem>
                        <SelectItem value="iam">IAM Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} type="text" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Login</Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href={"/"} className="mb-3 hover:underline">
          Forgot password?
        </Link>
      </CardFooter>
    </Card>
  );
};
