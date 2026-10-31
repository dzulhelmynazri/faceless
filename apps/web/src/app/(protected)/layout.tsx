import { headers } from "next/headers";
import { redirect } from "next/navigation";
import * as React from "react";

import { auth } from "@/services";

export const instant = false;

const ProtectedLayout = async ({ children }: LayoutProps<"/">) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  return await children;
};

export default ProtectedLayout;
