
import {
  userProfile,
  userContribution,
  userAchievements,
} from '@/lib/data';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { ContributionProgress } from '@/components/profile/contribution-progress';
import { Achievements } from '@/components/profile/achievements';

export default function ProfilePage() {
  return (
    <div className="bg-pattern">
      <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Welcome, {userProfile.name}!
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
            Manage your profile and track your community involvement.
          </p>
        </div>

        <div className="space-y-8">
          <ProfileTabs profile={userProfile} />
          <ContributionProgress contribution={userContribution} />
          <Achievements achievements={userAchievements} />
        </div>
      </div>
    </div>
  );
}
