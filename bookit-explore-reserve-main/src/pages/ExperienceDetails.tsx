import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Experience, BookingDetails } from "@/types/experience";

const ExperienceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadExperience = async () => {
      if (!id) return;
      try {
        const data = await api.getExperience(id);
        setExperience(data);
      } catch (error) {
        console.error('Failed to load experience:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExperience();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-xl">Experience not found</p>
        </div>
      </div>
    );
  }

  const subtotal = experience.price * quantity;
  const taxes = Math.round(subtotal * 0.06);
  const total = subtotal + taxes;

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time");
      return;
    }

    const bookingDetails: BookingDetails = {
      experienceId: experience.id,
      experienceName: experience.title,
      date: selectedDate,
      time: selectedTime,
      quantity,
      price: subtotal,
      taxes,
      total
    };

    navigate("/checkout", { state: { booking: bookingDetails } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Details
        </button>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div>
            <div className="mb-6 overflow-hidden rounded-xl">
              <img
                src={experience.image}
                alt={experience.title}
                className="aspect-video w-full object-cover"
              />
            </div>

            <h1 className="mb-4 text-3xl font-bold">{experience.title}</h1>
            <p className="mb-6 text-muted-foreground">{experience.longDescription}</p>

            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Choose date</h2>
              <div className="flex flex-wrap gap-2">
                {experience.availableDates.map((date) => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? "default" : "outline"}
                    onClick={() => setSelectedDate(date)}
                  >
                    {date}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Choose time</h2>
              <div className="flex flex-wrap gap-2">
                {experience.availableTimes.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    onClick={() => !slot.soldOut && setSelectedTime(slot.time)}
                    disabled={slot.soldOut}
                    className="relative"
                  >
                    {slot.time}
                    {!slot.soldOut && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {slot.available} left
                      </span>
                    )}
                    {slot.soldOut && (
                      <span className="ml-2 text-xs font-bold text-destructive">
                        Sold out
                      </span>
                    )}
                  </Button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                All times are in IST (GMT +5:30)
              </p>
            </div>

            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">About</h2>
              <p className="rounded-lg bg-muted p-4 text-sm">
                Scenic routes, trained guides, and safety briefing. Minimum age 10.
              </p>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl bg-muted p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Starts at</span>
                <span className="text-2xl font-bold">₹{experience.price}</span>
              </div>

              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded border"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded border"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-4 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-medium">₹{taxes}</span>
                </div>
              </div>

              <div className="mb-4 flex justify-between border-t pt-4">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">₹{total}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleConfirm}
                disabled={!selectedDate || !selectedTime}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExperienceDetails;
