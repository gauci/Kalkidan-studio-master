import { Card, Container, Heading, Text, Grid, Box, Stack, Badge } from '@sanity/ui'
import { DashboardWidget } from 'sanity'

export function Dashboard(): DashboardWidget {
  return {
    name: 'kalkidan-dashboard',
    component: DashboardComponent,
  }
}

function DashboardComponent() {
  return (
    <Container width={4}>
      <Stack space={4}>
        <Box>
          <Heading size={3}>Welcome to Kalkidan CMS</Heading>
          <Text muted>Manage your community content and announcements</Text>
        </Box>

        <Grid columns={[1, 2, 3]} gap={4}>
          <Card padding={4} radius={2} shadow={1}>
            <Stack space={3}>
              <Heading size={2}>📢 Quick Actions</Heading>
              <Stack space={2}>
                <Text size={1}>• Create new announcement</Text>
                <Text size={1}>• Schedule an event</Text>
                <Text size={1}>• Write an article</Text>
                <Text size={1}>• Add a new page</Text>
              </Stack>
            </Stack>
          </Card>

          <Card padding={4} radius={2} shadow={1}>
            <Stack space={3}>
              <Heading size={2}>📊 Content Status</Heading>
              <Stack space={2}>
                <Text size={1}>
                  <Badge tone="positive" mode="outline">Published</Badge>
                  {' '}content is live on your website
                </Text>
                <Text size={1}>
                  <Badge tone="caution" mode="outline">Draft</Badge>
                  {' '}content is saved but not visible to visitors
                </Text>
              </Stack>
            </Stack>
          </Card>

          <Card padding={4} radius={2} shadow={1}>
            <Stack space={3}>
              <Heading size={2}>🎯 Content Tips</Heading>
              <Stack space={2}>
                <Text size={1}>• Use clear, descriptive titles</Text>
                <Text size={1}>• Add alt text to images</Text>
                <Text size={1}>• Set appropriate categories</Text>
                <Text size={1}>• Preview before publishing</Text>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Card padding={4} radius={2} shadow={1} tone="primary">
          <Stack space={3}>
            <Heading size={2}>🚀 Getting Started</Heading>
            <Text>
              This CMS is designed specifically for the Kalkidan community. 
              You can create announcements for members, schedule events, 
              write articles, and manage general pages for your website.
            </Text>
            <Text size={1} muted>
              Need help? Contact your system administrator or check the documentation.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}