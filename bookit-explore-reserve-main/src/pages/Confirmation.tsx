import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingRef } = location.state || { bookingRef: "UNKNOWN" };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="mb-2 text-3xl font-bold">
          <span className="bg-primary px-2 py-1">Booking Confirmed</span>
        </h1>

        <p className="mb-8 text-muted-foreground">
          Ref ID: <span className="font-semibold">{bookingRef}</span>
        </p>

        <Button size="lg"z onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </main>
    </div>
  );
};

export default Confirmation;
