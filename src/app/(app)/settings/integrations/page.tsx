"use client";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader, Settings } from "~/components/ui/icons";
import { api } from "~/trpc/react";

import { IntegrationCredentialsForm } from "~/components/settings/integration-credentials-form";

export default function IntegrationSettingsPage() {
  const managementContext = api.invite.getManagementContext.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const familyId = managementContext.data?.family?.id;
  const familyName = managementContext.data?.family?.name;

  if (managementContext.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader className="size-4 animate-spin" />
        Loading integration settings...
      </div>
    );
  }

  if (!familyId) {
    return (
      <Alert>
        <AlertDescription>Join a family before managing integration credentials.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-semibold text-xl tracking-tight">Integrations</h2>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Manage owner-controlled integration credentials for {familyName ?? "your family"}. The
          first supported integration is object storage, but the schema is designed to expand to AI
          and other external services later.
        </p>
      </div>

      <IntegrationCredentialsForm familyId={familyId} />
    </div>
  );
}