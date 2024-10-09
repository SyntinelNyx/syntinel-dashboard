"use client";
import { useForm } from "react-hook-form";
import Link from "next/link";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const LoginFormSchema = z.object({
  username: z.string().min(1, {
    message: "Username cannot be empty.",
  }),
  password: z.string().min(1, {
    message: "Password cannot be empty.",
  }),
});

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

export const LoginForm = () => {
  const loginForm = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof LoginFormSchema>) {
    console.log(data);
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

export const RegisterForm = () => {
  const registerForm = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof LoginFormSchema>) {
    console.log(data);
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
