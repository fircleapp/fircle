"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { Loader } from "~/components/ui/icons";

import { api } from "~/trpc/react";

export function MembershipGuard({ children }: { children: React.ReactNode }) {
  const signOutTriggered = useRef(false);

  const managementContext = api.invite.getManagementContext.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const hasFamilyMembership = Boolean(managementContext.data?.family?.id);

  useEffect(() => {
    if (!managementContext.isFetched || hasFamilyMembership || signOutTriggered.current) {
      return;
    }

    signOutTriggered.current = true;
    void signOut({ callbackUrl: "/auth/signin" });
  }, [hasFamilyMembership, managementContext.isFetched]);

  if (managementContext.isLoading || (!hasFamilyMembership && !signOutTriggered.current)) {
    return (
      <div className="flex flex-col gap-2 min-h-dvh items-center justify-center px-4 text-center text-foreground text-sm">
        <p className="font-semibold text-xl leading-none tracking-tight">Fircle</p>
        <Loader className="size-6 animate-spin" />
      </div>
    );
  }

  return children;
}