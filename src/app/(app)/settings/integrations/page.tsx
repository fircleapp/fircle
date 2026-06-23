"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Loader, Settings } from "~/components/ui/icons";
import {
  type IntegrationCategory,
  type IntegrationProvider,
} from "~/lib/integration-providers";
import { api } from "~/trpc/react";

import { IntegrationCredentialsForm } from "~/components/settings/integration-credentials-form";
import { IntegrationList } from "~/components/settings/integration-list";

type IntegrationSelection = {
  category: IntegrationCategory;
  provider: IntegrationProvider;
};

export default function IntegrationSettingsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selection, setSelection] = useState<IntegrationSelection>({
    category: "storage",
    provider: "r2",
  });

  const bootstrapStatus = api.setup.getBootstrapStatus.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const managementContext = api.invite.getManagementContext.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const utils = api.useUtils();

  const familyId = managementContext.data?.family?.id;
  const familyName = managementContext.data?.family?.name;
  const isSelfHosted = bootstrapStatus.data?.selfHosted === true;

  if (managementContext.isLoading || bootstrapStatus.isLoading) {
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
          {isSelfHosted
            ? `This self-hosted instance reads storage credentials from environment variables. Manual integration setup is not required for ${familyName ?? "your family"}.`
            : `Manage owner-controlled integration credentials for ${familyName ?? "your family"} from a clean list view. Open credential configuration only when adding or editing an integration.`}
        </p>
      </div>

      {isSelfHosted ? (
        <Alert>
          <AlertDescription>
            Storage credentials are environment-managed in self-hosted mode and are loaded from
            server env variables.
          </AlertDescription>
        </Alert>
      ) : null}

      <IntegrationList
        familyId={familyId}
        isSelfHosted={isSelfHosted}
        onAddIntegration={(nextSelection) => {
          if (isSelfHosted) {
            return;
          }
          setSelection(nextSelection);
          setIsDialogOpen(true);
        }}
        onConfigureIntegration={(nextSelection) => {
          if (isSelfHosted) {
            return;
          }
          setSelection(nextSelection);
          setIsDialogOpen(true);
        }}
      />

      <Dialog open={!isSelfHosted && isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Configure integration credentials</DialogTitle>
            <DialogDescription>
              Configure and test credentials for {selection.category}/{selection.provider}.
            </DialogDescription>
          </DialogHeader>

          <IntegrationCredentialsForm
            familyId={familyId}
            initialCategory={selection.category}
            initialProvider={selection.provider}
            compact
            onCancel={() => setIsDialogOpen(false)}
            onSaved={async () => {
              await utils.integration.listIntegrationCredentials.invalidate({ familyId });
              await utils.integration.getIntegrationCredential.invalidate({
                familyId,
                category: selection.category,
              });
              setIsDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}