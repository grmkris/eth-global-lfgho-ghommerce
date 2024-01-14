import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useAppDrawer } from "@/drawers/AppDrawer.tsx";

export const BasicDrawerScreen = () => {
  const drawer = useAppDrawer();
  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Are you sure absolutely sure?</DrawerTitle>
        <DrawerDescription>This action cannot be undone.</DrawerDescription>
      </DrawerHeader>
      <DrawerFooter>
        <Button>Submit</Button>
        <DrawerClose>
          <Button onClick={drawer.close}>Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  );
};
