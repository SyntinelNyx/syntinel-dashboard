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
    tooltip: "List of all assets"
  },
  {
    title: "Vulnerabilities",
    url: "/dashboard/vulnerabilities",
    icon: Bug,
    tooltip: "List of vulnerabilities on the assets"
  },
  {
    title: "Scans",
    url: "/dashboard/scans",
    icon: Blocks,
    tooltip: "List of scans performed for the assets"
  },
  {
    title: "Environments",
    url: "/dashboard/environments",
    icon: Container,
    tooltip: "Environment orchestration for assets"
  },
  {
    title: "Actions",
    url: "/dashboard/actions",
    icon: ChevronsLeftRightEllipsis,
    tooltip: "Actions for patching/deployments"
  },
  {
    title: "Snapshots",
    url: "/dashboard/snapshots",
    icon: CircleFadingPlus,
    tooltip: "List of snapshots from the assets"
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
        tooltip: "Manage IAM user for the root account"
      },
      {
        title: "Role Management",
        url: "/dashboard/settings/role-management",
        icon: Shield,
        tooltip: "Manage roles for the root account"
      },
    ],
  },
];
