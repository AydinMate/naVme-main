import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import SettingsForm from "./components/settings-form";

interface SettingsPageProps {
  params: {
    customerId: string;
  };
}

const SettingsPage: React.FC<SettingsPageProps> = async ({ params }) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const customerSettings = await prismadb.customer.findFirst({
    where: {
      id: params.customerId,
      userId,
    },
    select: {
      name: true,
      address: true,
      vehicles: true
    }
  });

  if (!customerSettings) {
    redirect("/auth");
  }
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialSettings={customerSettings}/>
      </div>
    </div>
  );
};

export default SettingsPage;