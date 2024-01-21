import { useQuery } from "@tanstack/react-query";
import { GhommerceSDK } from "ghommerce-sdk/src";

export const useGhommerceSDK = () => {
  const ghommerceSDK = useQuery({
    queryKey: ["ghommerce-sdk"],
    queryFn: async () => {
      return await GhommerceSDK({
        url: import.meta.env.VITE_IFRAME_SDK_URL ?? "http://localhost:5321",
        actions: {
          onHelloWorld: (param) => {
            console.log("hello world", param.name);
            return { message: "hello world" };
          },
        },
      });
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });
  return ghommerceSDK;
};
