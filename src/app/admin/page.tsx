
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Megaphone, FileText, CheckCircle, ExternalLinkIcon, EditIcon, Shield } from "lucide-react";
import { members, announcements, downloadableFiles } from "@/lib/data";
import Link from "next/link";

export default function AdminDashboardPage() {
  const pendingMembers = members.filter(m => m.status === 'Pending').length;
  const overdueContributions = members.filter(m => m.contributions === 'Overdue').length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingMembers} pending approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Announcements
            </CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">
              Total posts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{downloadableFiles.length}</div>
            <p className="text-xs text-muted-foreground">
              Available for download
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueContributions}</div>
            <p className="text-xs text-muted-foreground">
              Members with overdue payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EditIcon className="h-5 w-5" />
              Content Management
            </CardTitle>
            <CardDescription>
              Manage website content, articles, and announcements through Sanity CMS.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Link href="/admin/content">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Content Dashboard
                </Button>
              </Link>
              <Link href={process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || '/studio'} target="_blank">
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  Open Sanity Studio
                </Button>
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              Create and manage articles, announcements, events, and pages for the website.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user accounts, roles, and permissions for the CMS system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/security">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Monitoring
                </Button>
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              View all users, change roles, monitor security, and manage account status for CMS access.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A log of recent administrative actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Activity log coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
