import type { Db, DbPoolTransaction } from "./db";
import type { User } from "./user.schema";
import type { CreateWorkspace, InsertWorkspace } from "./workspace.schema";
import { newId } from "../utils/id";
import { sqlIncrement } from "../utils/sql";
import { _Users_To_Workspaces } from "./user.sql";
import { Workspaces } from "./workspace.sql";

interface InsertWorkspaceTransactionProps {
  workspace: InsertWorkspace;
  creatorId: User["id"];
}

async function createWorkspaceTransaction(
  props: InsertWorkspaceTransactionProps,
  tx: DbPoolTransaction,
) {
  // create workspace
  const workspace = (
    await tx
      .insert(Workspaces)
      .values({
        ...props.workspace,
        id: props.workspace.id,
      })
      .returning()
  )[0];

  // associate user with workspace
  await tx.insert(_Users_To_Workspaces).values({
    userId: props.creatorId,
    workspaceId: props.workspace.id,
  });

  // const workspace = await tx.query.Workspaces.findFirst({
  // 	where: eq(Workspaces.id, props.workspace.id),
  // });
  return workspace;
}

interface CreateWorkspaceProps {
  workspace: CreateWorkspace;
  creatorId: User["id"];
}

export async function createWorkspace(
  props: CreateWorkspaceProps,
  db: Db,
  tx?: DbPoolTransaction,
) {
  const newWorkspaceId = newId("workspace");

  // console.log('newWorkspaceId', newWorkspaceId);

  const insertWorkspaceProps: InsertWorkspaceTransactionProps = {
    workspace: {
      ...props.workspace,
      id: newWorkspaceId,
    },
    creatorId: props.creatorId,
  };

  console.log("insertWorkspaceProps", insertWorkspaceProps);

  if (tx) {
    console.log("creating workspace within transaction");
    return await createWorkspaceTransaction(insertWorkspaceProps, tx);
  } else {
    console.log("creating transaction and workspace");
    const dbWorkspace = await db.pool.transaction(async (tx) => {
      return await createWorkspaceTransaction(insertWorkspaceProps, tx);
    });
    return dbWorkspace;
  }
}

export async function incrementWorkspaceFileUsage(
  workspaceId: string,
  fileSizeInBytes: number,
  db: Db,
  tx?: DbPoolTransaction,
) {
  if (tx) {
    await tx.update(Workspaces).set({
      fileUsage_total: sqlIncrement(
        Workspaces.fileUsage_total,
        fileSizeInBytes,
      ),
      fileUsage_billingCycle: sqlIncrement(
        Workspaces.fileUsage_billingCycle,
        fileSizeInBytes,
      ),
    });
  } else {
    await db.pool.update(Workspaces).set({
      fileUsage_total: sqlIncrement(
        Workspaces.fileUsage_total,
        fileSizeInBytes,
      ),
      fileUsage_billingCycle: sqlIncrement(
        Workspaces.fileUsage_billingCycle,
        fileSizeInBytes,
      ),
    });
  }
}
