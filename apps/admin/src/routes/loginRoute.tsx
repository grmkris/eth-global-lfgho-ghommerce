import { rootRoute } from "@/App.tsx";
import { Route } from "@tanstack/react-router";
import { z } from "zod";
import logo from "@/assets/dev_logo.png";
import { Button } from "@/components/ui/button.tsx";
import { Auth } from "@supabase/auth-ui-react";
import {
  // Import predefined theme
  ThemeSupa,
} from "@supabase/auth-ui-shared";

import { supabase } from "@/features/TrpcProvider.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useEffectOnce } from "usehooks-ts";

export const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "login",
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
}).update({
  component: AuthenticationPage,
});

function AuthenticationPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const search = loginRoute.useSearch();
  const queryClient = useQueryClient();
  useEffectOnce(() => {
    const sub = supabase.auth.onAuthStateChange(async (event) => {
      if (event !== "SIGNED_IN") return;
      console.log("event", { event, search });
      await queryClient.invalidateQueries();
      await router.invalidate();
      await router.navigate({
        to: search.redirect ? search.redirect : "/",
      });
    });
    return () => {
      sub.data.subscription.unsubscribe();
    };
  });

  console.log("search", search);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <div className=" mb-0">
          <img
            src={logo}
            alt="logo"
            className="max-w-[150px] md:max-w-[200px] animate-bounce"
          />
        </div>
        <div className="foreground bg-gray-800 button rounded-md">
          <div className="m-8 mt-8 mb-2">
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />

            <div className="text-center text-white text-sm">
              <span>
                By continuing, you agree to our{" "}
                <a className="underline">Terms of Service</a> and{" "}
                <a className="underline">Privacy Policy.</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
