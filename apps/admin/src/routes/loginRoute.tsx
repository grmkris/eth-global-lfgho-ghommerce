import { rootRoute } from "@/App.tsx";
import { Route } from "@tanstack/react-router";
import { z } from "zod";

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
      <div className="md:hidden">
        <img
          src="/examples/authentication-light.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="block dark:hidden"
        />
        <img
          src="/examples/authentication-dark.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden dark:block"
        />
      </div>
      <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Button
          variant={"ghost"}
          onClick={() => setIsLogin(!isLogin)}
          className="absolute right-4 top-4 md:right-8 md:top-8"
        >
          {isLogin ? "Sign Up" : "Sign In"}
        </Button>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            Web3Pay
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This library has saved me countless hours of work and
                helped me deliver stunning designs to my clients faster than
                ever before.&rdquo;
              </p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
          </div>
        </div>
      </div>
    </>
  );
}
