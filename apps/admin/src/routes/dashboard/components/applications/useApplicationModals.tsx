import { create } from "zustand";
import { CreateDonationModal } from "./CreateDonationModal.tsx";
import { ApplicationType } from "@/routes/dashboard/components/applications/ApplicationCard.tsx";

export type ApplicationModalType = ApplicationType;
type ModalDataType = {
  userId: string;
};

type IModalStore = {
  isOpen: boolean;
  view?: ApplicationModalType;
  data?: ModalDataType;
  open: (view: ApplicationModalType, data?: ModalDataType) => void;
  close: () => void;
};

export const useApplicationModals = create<IModalStore>((set) => ({
  isOpen: false,
  view: undefined,
  data: undefined,
  open: (view: IModalStore["view"], data?: ModalDataType) => {
    set({
      isOpen: true,
      view,
      data,
    });
  },
  close: () => {
    set({
      isOpen: false,
      view: undefined,
      data: undefined,
    });
  },
}));

export const ApplicationModals = () => {
  const modals = useApplicationModals();

  if (!modals.view) return null;

  return <div>{modals.view === "donations" && <CreateDonationModal />}</div>;
};
