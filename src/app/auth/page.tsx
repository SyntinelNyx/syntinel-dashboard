"use client";
import { useState } from "react";
import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/Forms/AuthForms/LoginForm";
import { RegisterForm } from "@/components/Forms/AuthForms/RegisterForm";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <main className="flex h-screen justify-center font-[family-name:var(--font-geist-sans)] md:justify-start">
      <div className="hidden md:flex md:w-[60%]">
        <Image
          src={"/auth-cover.jpg"}
          alt={"Cover image for authentication page"}
          width={500}
          height={500}
          draggable={"false"}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex items-center justify-center md:w-[40%]">
        <Tabs
          defaultValue="login"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-[400px] px-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm onSuccess={() => setActiveTab("login")} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
