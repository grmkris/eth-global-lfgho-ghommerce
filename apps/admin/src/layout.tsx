import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { cn } from "@/components/utils.ts";
import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { SettingsIcon } from "lucide-react";

import { supabase } from "@/features/TrpcProvider.tsx";
import { SIDEBAR_ROUTES } from "@/features/auto-admin/generateAppConfig.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./components/ui/avatar.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu.tsx";

export const Layout = () => {
  return (
    <div>
      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <div className={"mt-4 ml-2"}>
                  <UserNav />
                </div>
              </li>
              <li>
                <h1 className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                  Views
                </h1>
                <ul className="-mx-2 space-y-1">
                  <li key={"home"}>
                    <Link
                      to={"/"}
                      className={cn(
                        "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                        "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                      )}
                    >
                      Home
                    </Link>
                  </li>
                </ul>
                <Separator className={"m-4"} />
                <h1 className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                  Entities
                </h1>
                <ul className="-mx-2 space-y-1">
                  {SIDEBAR_ROUTES.map((item) => (
                    <li key={item}>
                      <Link
                        to={`/${item}`}
                        className={cn(
                          "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                        )}
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <a
                  href="/"
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                >
                  <SettingsIcon
                    className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600"
                    aria-hidden="true"
                  />
                  Settings
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

/**
 * Popup menu for user profile, with clickable avatar
 *
 */
export function UserNav() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const logout = useMutation({
    mutationFn: async () => {
      const result = await supabase.auth.signOut();
      console.log("result", result);
      await queryClient.invalidateQueries();
      await router.invalidate();
      return result;
    },
  });

  useHotkeys("shift+ctrl+q", () => logout.mutate());
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/03.png" alt="@shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">shadcn</p>
            <p className="text-xs leading-none text-muted-foreground">
              m@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout.mutate()}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
