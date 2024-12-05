import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const actions = [
  {
    actionName: "Action 1",
    createdBy: "Alice",
    date: "November 1, 2024",
    labels: ["Frontend", "React"],
  },
  {
    actionName: "Action 2",
    createdBy: "Bob",
    date: "October 30, 2024",
    labels: ["Backend", "Node.js"],
  },
  {
    actionName: "Action 3",
    createdBy: "Charlie",
    date: "October 15, 2024",
    labels: ["Database", "PostgreSQL"],
  },
  {
    actionName: "Action 4",
    createdBy: "Diana",
    date: "November 2, 2024",
    labels: ["DevOps", "Docker"],
  },
  {
    actionName: "Action 5",
    createdBy: "Eve",
    date: "September 20, 2024",
    labels: ["Security", "JWT"],
  },
  {
    actionName: "Action 1",
    createdBy: "Alice",
    date: "November 1, 2024",
    labels: ["Frontend", "React"],
  },
  {
    actionName: "Action 2",
    createdBy: "Bob",
    date: "October 30, 2024",
    labels: ["Backend", "Node.js"],
  },
  {
    actionName: "Action 3",
    createdBy: "Charlie",
    date: "October 15, 2024",
    labels: ["Database", "PostgreSQL"],
  },
  {
    actionName: "Action 4",
    createdBy: "Diana",
    date: "November 2, 2024",
    labels: ["DevOps", "Docker"],
  },
  {
    actionName: "Action 5",
    createdBy: "Eve",
    date: "September 20, 2024",
    labels: ["Security", "JWT"],
  },
  {
    actionName: "Action 1",
    createdBy: "Alice",
    date: "November 1, 2024",
    labels: ["Frontend", "React"],
  },
  {
    actionName: "Action 2",
    createdBy: "Bob",
    date: "October 30, 2024",
    labels: ["Backend", "Node.js"],
  },
  {
    actionName: "Action 3",
    createdBy: "Charlie",
    date: "October 15, 2024",
    labels: ["Database", "PostgreSQL"],
  },
  {
    actionName: "Action 4",
    createdBy: "Diana",
    date: "November 2, 2024",
    labels: ["DevOps", "Docker"],
  },
  {
    actionName: "Action 5",
    createdBy: "Eve",
    date: "September 20, 2024",
    labels: ["Security", "JWT"],
  },
  {
    actionName: "Action 1",
    createdBy: "Alice",
    date: "November 1, 2024",
    labels: ["Frontend", "React"],
  },
  {
    actionName: "Action 2",
    createdBy: "Bob",
    date: "October 30, 2024",
    labels: ["Backend", "Node.js"],
  },
  {
    actionName: "Action 3",
    createdBy: "Charlie",
    date: "October 15, 2024",
    labels: ["Database", "PostgreSQL"],
  },
  {
    actionName: "Action 4",
    createdBy: "Diana",
    date: "November 2, 2024",
    labels: ["DevOps", "Docker"],
  },
  {
    actionName: "Action 5",
    createdBy: "Eve",
    date: "September 20, 2024",
    labels: ["Security", "JWT"],
  },
];

const Chip: React.FC<{ label: string }> = ({ label }) => {
  return (
    <span className="m-1 inline-flex items-center rounded-full bg-gray-800 px-2 py-1 text-sm font-medium text-white">
      {label}
    </span>
  );
};

export default function ActionsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <h2 className="text-lg font-semibold">{action.actionName}</h2>
              <p className="text-sm text-gray-300">
                Created by: {action.createdBy}
              </p>
              <p className="text-sm text-gray-300">Date: {action.date}</p>
            </CardHeader>
            <CardContent>
              <div className="mt-2 flex flex-wrap">
                {action.labels.map((label, idx) => (
                  <Chip key={idx} label={label} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
