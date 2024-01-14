import { Drawer, DrawerContent } from "@/components/ui/drawer.tsx";
import { create } from "zustand";
import { BasicDrawerScreen } from "@/drawers/BasicDrawerScreen.tsx";
import { AdvancedDrawerScreen } from "@/drawers/AdvancedDrawerScreen.tsx";

export const AppDrawer = (props: {
  container: HTMLElement | null;
}) => {
  const drawer = useAppDrawer();
  return (
    <Drawer
      open={drawer.isOpen}
      onOpenChange={(open) => {
        if (!open) {
          drawer.close();
        }
      }}
    >
      <DrawerContent container={props.container}>
        {drawer.screen.name === "basic" && <BasicDrawerScreen />}
        {drawer.screen.name === "advanced" && <AdvancedDrawerScreen />}
      </DrawerContent>
    </Drawer>
  );
};

export type AppDrawerState = {
  isOpen: boolean;
  screen:
    | {
        name: "basic";
      }
    | {
        name: "advanced";
      };

  open: (screen: AppDrawerState["screen"]) => void;
  close: () => void;
};

export const useAppDrawer = create<AppDrawerState>((set) => ({
  isOpen: false,
  screen: { name: "basic" },
  open: (screen) => set(() => ({ isOpen: true, screen })),
  close: () => set(() => ({ isOpen: false })),
}));
