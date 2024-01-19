import { create } from "zustand";
import { ApplicationModal } from "./ApplicationModal";

export type ModalViewType = "applicationModal";

type IModalStore = {
  isOpen: boolean;
  view?: ModalViewType;
  open: (view: ModalViewType) => void;
  close: () => void;
};

export const useApplicationModals = create<IModalStore>((set) => ({
  isOpen: false,
  view: undefined,
  data: undefined,
  open: (view: IModalStore["view"]) => {
    set({
      isOpen: true,
      view,
    });
  },
  close: () => {
    set({
      isOpen: false,
    });
  },
}));

export const ApplicationModals = () => {
  const modals = useApplicationModals();

  if (!modals.view) return null;

  return (
    <div>{modals.view === "applicationModal" && <ApplicationModal />}</div>
  );
};
