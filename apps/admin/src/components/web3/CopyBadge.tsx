import { useToast } from "@/components/ui/use-toast.ts";
import { Badge } from "@/components/ui/badge.tsx";

/**
 * Address label that can be copied to clipboard, it displays first 8 and last 4 characters of the address
 * If the address is shorter than 12 characters, it displays the full address
 * @param props
 * @constructor
 */
export const CopyBadge = (props: {
  label: string;
  type: "address" | "txHash" | "uuid";
}) => {
  const toast = useToast();
  const handleClick = () => {
    navigator.clipboard.writeText(props.label).then(() => {
      toast.toast({ title: "Copied to clipboard", variant: "default" });
    });
  };

  const formatLabel = (label: string) => {
    // If the label is shorter than or equal to 12 characters, return the full label
    if (label.length <= 12) {
      return label;
    }
    // Otherwise, return the formatted label with first 8 and last 4 characters
    return `${label.slice(0, 8)}...${label.slice(-4)}`;
  };

  return (
    <Badge onClick={handleClick} className="cursor-pointer">
      {formatLabel(props.label)}
    </Badge>
  );
};
