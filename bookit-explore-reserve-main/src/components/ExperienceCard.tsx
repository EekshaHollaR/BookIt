import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Experience } from "@/types/experience";
import { useNavigate } from "react-router-dom";

interface ExperienceCardProps {
  experience: Experience;
}

export const ExperienceCard = ({ experience }: ExperienceCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className={`overflow-hidden border-2 ${experience.borderColor || "border-transparent"} transition-shadow hover:shadow-lg`}>
      <div className="relative aspect-video overflow-hidden">
        <img
          src={experience.image}
          alt={experience.title}
          className="h-full w-full object-cover"
        />
        {experience.badge && (
          <div className={`absolute right-2 top-2 rounded px-2 py-1 text-xs font-bold ${experience.badge.color}`}>
            {experience.badge.text}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-semibold">{experience.title}</h3>
          <span className="rounded bg-muted px-2 py-0.5 text-xs">{experience.location}</span>
        </div>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {experience.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">From </span>
            <span className="text-lg font-bold">₹{experience.price}</span>
          </div>
          <Button onClick={() => navigate(`/experience/${experience.id}`)}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
