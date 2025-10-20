
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Eye, LogIn } from "lucide-react";
import type { Achievement } from "@/lib/data";

const iconMap: { [key: string]: React.ReactNode } = {
  'Community Pillar': <LogIn className="h-8 w-8 text-accent" />,
  'Active Voice': <Eye className="h-8 w-8 text-accent" />,
  'default': <Award className="h-8 w-8 text-accent" />,
}

export function Achievements({ achievements }: { achievements: Achievement[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Achievements</CardTitle>
        <CardDescription>
          Badges earned for community participation.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="flex flex-col items-center text-center p-4 border rounded-lg bg-secondary/50">
            {iconMap[achievement.name] || iconMap['default']}
            <p className="mt-2 font-semibold text-sm">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
          </div>
        ))}
        {!achievements.length && <p className="col-span-full text-center text-muted-foreground">No achievements yet. Keep participating!</p>}
      </CardContent>
    </Card>
  );
}
