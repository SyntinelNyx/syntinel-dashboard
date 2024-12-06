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
  Shield
} from "lucide-react";

export const items = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Assets",
    url: "/dashboard/assets",
    icon: HardDrive,
  },
  {
    title: "Vulnerabilities",
    url: "/dashboard/vulnerabilities",
    icon: Bug,
  },
  {
    title: "Environments",
    url: "/dashboard/environments",
    icon: Container,
  },
  {
    title: "Actions",
    url: "/dashboard/actions",
    icon: ChevronsLeftRightEllipsis,
  },
  {
    title: "Snapshots",
    url: "/dashboard/snapshots",
    icon: CircleFadingPlus,
  },
  {
    title: "Plugins",
    url: "/dashboard/plugins",
    icon: Blocks,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    subitem: [
      {
        title: "User Management",
        url: "/dashboard/settings/management",
        icon: UsersRound
      },
      {
        title: "Role Management",
        url: "/dashboard/settings/role-management",
        icon: Shield
      }
    ]
  },
];
