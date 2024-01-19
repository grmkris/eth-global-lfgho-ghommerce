import { create } from "zustand";
import { ApplicationModal } from "./ApplicationModal";

export type ModalViewType = "applicationModal";
type ModalDataType = {
  userId: string
}

type IModalStore = {
  isOpen: boolean;
  view?: ModalViewType;
  data?: ModalDataType;
  open: (view: ModalViewType, data?: ModalDataType) => void;
  close: () => void;
};

export const useApplicationModals = create<IModalStore>((set) => ({
  isOpen: false,
  view: undefined,
  data: undefined,
  open: (view: IModalStore["view"], data? : ModalDataType) => {
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

  return (
    <div>{modals.view === "applicationModal" && <ApplicationModal />}</div>
  );
};
