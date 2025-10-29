import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { BookingDetails } from "@/types/experience";
import { toast } from "sonner";
import { api } from "@/lib/api";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking as BookingDetails;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [discount, setDiscount] = useState(0);

  if (!booking) {
    navigate("/");
    return null;
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    try {
      const result = await api.validatePromo(promoCode);
      if (result.valid && result.discount) {
        setDiscount(result.discount);
        toast.success(`Promo code applied! ₹${result.discount} discount`);
      } else {
        toast.error(result.error || "Invalid promo code");
      }
    } catch (error) {
      toast.error("Failed to validate promo code");
      console.error('Promo validation error:', error);
    }
  };

  const finalTotal = booking.total - discount;

  const handlePayment = async () => {
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to terms and safety policy");
      return;
    }

    try {
      const { bookingRef } = await api.createBooking({
        ...booking,
        fullName,
        email,
        discount,
        total: finalTotal,
      });
      
      navigate("/confirmation", { state: { bookingRef, booking } });
    } catch (error) {
      toast.error("Failed to create booking. Please try again.");
      console.error('Booking error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Checkout
        </button>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Full name</label>
              <Input
                type="text"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Promo code</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                />
                <Button variant="outline" onClick={handleApplyPromo}>
                  Apply
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm">
                I agree to the terms and safety policy
              </label>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl bg-muted p-6">
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium">{booking.experienceName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{booking.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{booking.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Qty</span>
                  <span className="font-medium">{booking.quantity}</span>
                </div>
              </div>

              <div className="mb-4 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{booking.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-medium">₹{booking.taxes}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-medium text-green-600">-₹{discount}</span>
                  </div>
                )}
              </div>

              <div className="mb-4 flex justify-between border-t pt-4">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">₹{finalTotal}</span>
              </div>

              <Button className="w-full" size="lg" onClick={handlePayment}>
                Pay and Confirm
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
