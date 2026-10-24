import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/services";

import Test from "./_components/test";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">Welcome {session.user.name}</p>
      <Test session={session} />
    </div>
  );
};

export default DashboardPage;
