"use client";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

import { apiFetch } from "@/lib/api-fetch";
import { useToast } from "@/hooks/use-toast";

const RegisterFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email cannot be empty." })
    .email("Email is not valid."),
  username: z.string().min(3, {
    message: "Username has to be longer than 3 characters.",
  }),
  password: z.string().min(12, {
    message: "Password has to be longer than 12 characters.",
  }),
});

export const RegisterForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();

  const registerForm = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof RegisterFormSchema>) {
    try {
      const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          username: data.username,
          password: data.password,
        }),
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Register Failed",
          description: await response.json(),
        });
        return;
      }

      onSuccess();
      toast({
        title: "Register Successful",
        description: "Successfully Registered Account",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An Unknown Error Has Occurred";

      toast({
        variant: "destructive",
        title: "Register Failed",
        description: errorMessage,
      });
    }
  }

  return (
    <Card>
      <CardHeader className="-mb-3 text-center text-2xl">
        <CardTitle>Register</CardTitle>
        <CardDescription>Register a root user account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Form {...registerForm}>
          <form
            onSubmit={registerForm.handleSubmit(onSubmit)}
            className="flex flex-col space-y-6"
          >
            <FormField
              control={registerForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
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
              control={registerForm.control}
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
            <Button type="submit">Register</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
