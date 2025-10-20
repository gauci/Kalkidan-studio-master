
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/data';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().min(5, 'Please enter a valid phone number.'),
  address: z.string().min(5, 'Please enter a valid address.'),
  email: z.string().email('Please enter a valid email address.'),
});

type FormValues = z.infer<typeof profileSchema>;

function ViewProfile({ profile }: { profile: UserProfile }) {
  return (
    <div className="space-y-4 text-foreground/90">
      <div className="space-y-1">
        <Label className="text-sm text-muted-foreground">Full Name</Label>
        <p className="text-base">{profile.name}</p>
      </div>
      <div className="space-y-1">
        <Label className="text-sm text-muted-foreground">Email Address</Label>
        <p className="text-base">{profile.email}</p>
      </div>
      <div className="space-y-1">
        <Label className="text-sm text-muted-foreground">Phone Number</Label>
        <p className="text-base">{profile.phone}</p>
      </div>
      <div className="space-y-1">
        <Label className="text-sm text-muted-foreground">Address</Label>
        <p className="text-base">{profile.address}</p>
      </div>
      <div className="space-y-1">
        <Label className="text-sm text-muted-foreground">Registered Family Members</Label>
        <ul className="list-disc list-inside text-base">
          {profile.familyMembers.map((member, i) => (
            <li key={i}>{member}</li>
          ))}
        </ul>
      </div>
      <Button disabled variant="outline" className="mt-4">Request Update from Admin</Button>
    </div>
  );
}

function EditProfile({ profile }: { profile: UserProfile }) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
    toast({
      title: 'Update Submitted',
      description: 'Your profile changes have been submitted for admin approval.',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
          Submit Changes
        </Button>
      </form>
    </Form>
  );
}

export function ProfileTabs({ profile }: { profile: UserProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Profile</CardTitle>
        <CardDescription>
          View your personal information and contribution status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">View Profile</TabsTrigger>
            <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="view" className="mt-6">
            <ViewProfile profile={profile} />
          </TabsContent>
          <TabsContent value="edit" className="mt-6">
            <EditProfile profile={profile} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
