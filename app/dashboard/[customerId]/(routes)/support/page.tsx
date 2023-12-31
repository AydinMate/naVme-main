import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import SupportForm from "./components/support-form";

interface SupportPageProps {
  params: {
    customerId: string;
  };
}

const SupportPage: React.FC<SupportPageProps> = async ({ params }) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const customer = await prismadb.customer.findFirst({
    where: {
      id: params.customerId,
      userId,
    },
  });

  if (!customer) {
    redirect("/auth");
  }
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SupportForm />
      </div>
    </div>
  );
};

export default SupportPage;
