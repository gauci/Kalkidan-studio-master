import { Badge, Card, Stack, Text, Flex } from '@sanity/ui'
import { CalendarIcon, CheckmarkIcon, EditIcon } from '@sanity/icons'

interface WorkflowStatusProps {
  document: {
    isPublished?: boolean
    publishedAt?: string
    scheduledPublishAt?: string
    _updatedAt?: string
  }
}

export function WorkflowStatus({ document }: WorkflowStatusProps) {
  const { isPublished, publishedAt, scheduledPublishAt, _updatedAt } = document

  const getStatus = () => {
    if (isPublished) {
      return { label: 'Published', tone: 'positive', icon: CheckmarkIcon }
    }
    if (scheduledPublishAt) {
      const scheduledDate = new Date(scheduledPublishAt)
      const now = new Date()
      if (scheduledDate > now) {
        return { label: 'Scheduled', tone: 'caution', icon: CalendarIcon }
      }
    }
    return { label: 'Draft', tone: 'default', icon: EditIcon }
  }

  const status = getStatus()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card padding={3} radius={2} tone={status.tone} border>
      <Stack space={2}>
        <Flex align="center" gap={2}>
          <status.icon />
          <Badge tone={status.tone} mode="outline">
            {status.label}
          </Badge>
        </Flex>
        
        {isPublished && publishedAt && (
          <Text size={1} muted>
            Published: {formatDate(publishedAt)}
          </Text>
        )}
        
        {scheduledPublishAt && !isPublished && (
          <Text size={1} muted>
            Scheduled for: {formatDate(scheduledPublishAt)}
          </Text>
        )}
        
        {_updatedAt && (
          <Text size={1} muted>
            Last updated: {formatDate(_updatedAt)}
          </Text>
        )}
      </Stack>
    </Card>
  )
}