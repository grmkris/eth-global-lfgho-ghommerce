import { Button } from "@/components/ui/button.tsx";
import { Outlet, useRouter } from "@tanstack/react-router";

import { supabase } from "@/features/TrpcProvider.tsx";
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
    <div className="p-12">
      <Outlet />
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
