import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useApplicationModals } from "./useApplicationModals";

export const ApplicationModal = () => {
  const { close, isOpen } = useApplicationModals((state) => ({
    close: state.close,
    isOpen: state.isOpen,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader className={"mt-4 mx-4"}>
          <DialogTitle>Host your Twich donations</DialogTitle>
          <DialogDescription>
            Connect your store to one of the following applications to get
            started.
          </DialogDescription>
        </DialogHeader>
        <ApplicationForm />
      </DialogContent>
    </Dialog>
  );
};

const ApplicationForm = () => {
  const form = useForm();

  return <></>;
};
