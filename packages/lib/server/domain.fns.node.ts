import { eq } from "drizzle-orm";

import { cloudinary } from "./cloudinary.fns";
import { db } from "./db";
import { Domains } from "./domain.sql";

// cloudinary
export async function changeDomainForLinkImages(props: {
  oldDomain: string;
  newDomain: string;
}) {
  const links = await db.http.query.Links.findMany({
    where: eq(Domains.domain, props.oldDomain),
    columns: {
      key: true,
    },
  });

  if (links.length === 0) return null;

  try {
    return await Promise.all<unknown>(
      links.map(({ key }) =>
        cloudinary.rename(
          `${props.oldDomain}/${key}`,
          `${props.newDomain}/${key}`,
          {
            invalidate: true,
          },
        ),
      ),
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}
