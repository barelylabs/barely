import type { z } from "zod";
import { usePathname, useRouter } from "next/navigation";

import { api } from "../server/api/react";
import { updateWorkspaceSchema } from "../server/workspace.schema";
import { useWorkspace } from "./use-workspace";
import { useZodForm } from "./use-zod-form";

export function useWorkspaceUpdateForm() {
  const workspace = useWorkspace();
  const apiContext = api.useContext();

  const form = useZodForm({
    schema: updateWorkspaceSchema,
    values: workspace,
    resetOptions: {
      keepDirtyValues: true, // retain user-interacted input
    },
  });

  const router = useRouter();
  const currentPath = usePathname();

  const { mutate: updateWorkspace } = api.workspace.update.useMutation({
    onMutate: async (data) => {
      await apiContext.workspace.current.cancel();

      // check if the handle is changing. If it is we need to redirect to the new handle once the mutation has settled
      const handleChanged = data.handle !== workspace.handle;

      // pass handleChanged to onSettled so we can redirect if it's true
      return {
        handleChanged,
        oldHandle: workspace.handle,
        newHandle: data.handle,
      };
    },
    onSuccess: async (data, variables, context) => {
      if (
        context?.handleChanged &&
        context.oldHandle &&
        context.newHandle &&
        currentPath
      ) {
        return router.push(
          currentPath.replace(context.oldHandle, context.newHandle),
        );
      }

      await apiContext.workspace.current.invalidate();
      form.reset();
    },
  });

  const onSubmit = (data: z.infer<typeof updateWorkspaceSchema>) => {
    updateWorkspace(data);
  };

  return { form, onSubmit, isPersonal: workspace.type === "personal" };
}
