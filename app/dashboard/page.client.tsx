"use client";

import { Card } from "@/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveSessionsList } from "@/components/active-sessions-list";
import { ArchivedSessionsList } from "@/components/archived-sessions-list";
import { useSession } from "@/lib/auth-client";

export default function DashboardPageClient() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <main className="flex flex-col items-center justify-between p-24">
        <p className="font-bold">Loading...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-between p-24">
        <p className="font-bold">You are not signed in.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full gap-4 p-4 mx-auto max-w-7xl">
      <Card className="flex flex-col">
        <Tabs defaultValue="active" className="flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Sessions</TabsTrigger>
            <TabsTrigger value="past">Past Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="flex flex-col">
            <ActiveSessionsList />
          </TabsContent>

          <TabsContent value="past" className="flex flex-col">
            <ArchivedSessionsList />
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
}
