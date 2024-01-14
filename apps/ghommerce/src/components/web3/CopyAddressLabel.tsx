import { Address } from "schema/src/address.schema.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { Badge } from "@/components/ui/badge.tsx";

/**
 * Address label that can be copied to clipboard, it display first 4 and last 4 characters of the address
 * @param props
 * @constructor
 */
export const CopyAddressLabel = (props: {
  address: Address;
}) => {
  const toast = useToast();
  const handleClick = () => {
    navigator.clipboard.writeText(props.address).then(() => {
      toast.toast({ title: "Copied to clipboard", variant: "default" });
    });
  };

  return (
    <Badge onClick={handleClick} className="cursor-pointer">
      {props.address.slice(0, 8)}...{props.address.slice(-4)}
    </Badge>
  );
};
