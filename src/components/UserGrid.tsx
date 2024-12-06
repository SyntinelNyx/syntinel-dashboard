import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const users = [
  { username: "Alice", lastLogin: "November 1, 2024", isOnline: true },
  { username: "Bob", lastLogin: "October 30, 2024", isOnline: false },
  { username: "Charlie", lastLogin: "October 15, 2024", isOnline: true },
  { username: "Diana", lastLogin: "November 2, 2024", isOnline: false },
  { username: "Eve", lastLogin: "September 20, 2024", isOnline: true },
];

export default function UserGrid() {
  return (
    <Card className="mx-auto max-w-4xl p-1">
      <CardHeader>
        <h1 className="text-2xl font-bold">User List</h1>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user, index) => (
            <Card key={index} className="w-full p-1 shadow-md">
              <CardHeader>
                <h2 className="-mt-2 text-lg font-semibold">{user.username}</h2>
              </CardHeader>
              <CardContent>
                <p className="-mt-4 text-sm text-gray-600">
                  Last Login: {user.lastLogin}
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-block h-3 w-3 rounded-full ${
                      user.isOnline ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  <span className="ml-2 text-sm">
                    {user.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
