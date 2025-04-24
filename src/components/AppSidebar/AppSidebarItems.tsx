import {
  Home,
  HardDrive,
  Bug,
  ChevronsLeftRightEllipsis,
  CircleFadingPlus,
  Blocks,
  Settings,
  Container,
  UsersRound,
  Shield,
} from "lucide-react";

export const items = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Home,
    tooltip: "Overview of the dashboard"
  },
  {
    title: "Assets",
    url: "/dashboard/assets",
    icon: HardDrive,
    tooltip: ""
  },
  {
    title: "Vulnerabilities",
    url: "/dashboard/vulnerabilities",
    icon: Bug,
    tooltip: ""
  },
  {
    title: "Scans",
    url: "/dashboard/scans",
    icon: Blocks,
    tooltip: ""
  },
  {
    title: "Environments",
    url: "/dashboard/environments",
    icon: Container,
    tooltip: ""
  },
  {
    title: "Actions",
    url: "/dashboard/actions",
    icon: ChevronsLeftRightEllipsis,
    tooltip: ""
  },
  {
    title: "Snapshots",
    url: "/dashboard/snapshots",
    icon: CircleFadingPlus,
    tooltip: ""
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    subitem: [
      {
        title: "User Management",
        url: "/dashboard/settings/management",
        icon: UsersRound,
        tooltip: ""
      },
      {
        title: "Role Management",
        url: "/dashboard/settings/role-management",
        icon: Shield,
        tooltip: ""
      },
    ],
  },
];
