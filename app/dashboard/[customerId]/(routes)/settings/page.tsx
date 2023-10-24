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

  const customerDetails = await prismadb.customer.findFirst({
    where: {
      id: params.customerId,
      userId,
    },
    select: {
      name: true,
      vehicles: true,
    },
  });

  const originDetails = await prismadb.originDetails.findFirst({
    where: {
      customerId: params.customerId,
    },
    select: {
      address: true,
      lat: true,
      lng: true,
      radius: true,
      country: true
    },
  });

  const bounds = await prismadb.originDetails.findFirst({
    where: {
      customerId: params.customerId,
    },
    select: {
      north: true,
      east: true,
      south: true,
      west: true,
    },
  });

  if (!customerDetails || !originDetails || !bounds) {
    redirect("/auth");
  }

  const originalCustomerSettings = {
    ...customerDetails,
    ...originDetails,
    bounds: bounds,
    country: originDetails.country ? originDetails.country : null
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialSettings={originalCustomerSettings} />
      </div>
    </div>
  );
};

export default SettingsPage;
