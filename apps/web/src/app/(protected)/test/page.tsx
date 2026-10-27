import { headers } from "next/headers";

import { PageHeader } from "@/components/page-header";
import { auth } from "@/services";

import Test from "./_components/test";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome, ${session.user.name}`}
        description="This is the test page."
      />
      <Test session={session} />
    </div>
  );
};

export default DashboardPage;
