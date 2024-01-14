import { rootRoute } from "@/App.tsx";
import { setToken, supabase } from "@/features/TrpcProvider.tsx";
import { Layout } from "@/layout.tsx";
import { loginRoute } from "@/routes/loginRoute.tsx";
import { Outlet, Route, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

export const authRoute = new Route({
  getParentRoute: () => rootRoute,
  id: "auth",
  beforeLoad: async ({ context, location }) => {
    const session = await context.supabase.auth.getSession();
    if (!session.data.session?.access_token) {
      throw redirect({
        to: loginRoute.to,
        search: {
          redirect: location.href,
        },
      });
    }
    setToken(session?.data.session.access_token);
    return {
      session: session.data.session,
    };
  },
  component: () => {
    useEffect(() => {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log("supabase-event", event);
          if (session?.access_token) setToken(session?.access_token);
        },
      );
      return () => {
        authListener?.subscription.unsubscribe();
      };
    });
    return <Layout />;
  },
});

export const authOnboardingRoute = new Route({
  getParentRoute: () => rootRoute,
  id: "auth-onboarding",
  beforeLoad: async ({ context, location }) => {
    const session = await context.supabase.auth.getSession();
    if (!session.data.session?.access_token) {
      throw redirect({
        to: loginRoute.to,
        search: {
          redirect: location.href,
        },
      });
    }
    setToken(session?.data.session.access_token);
    return {
      session: session.data.session,
    };
  },
  component: () => {
    useEffect(() => {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log("supabase-event", event);
          if (session?.access_token) setToken(session?.access_token);
        },
      );
      return () => {
        authListener?.subscription.unsubscribe();
      };
    });
    return <Outlet />;
  },
});
