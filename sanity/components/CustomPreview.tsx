import { Card, Text, Badge, Flex, Box } from '@sanity/ui'
import { format } from 'date-fns'

interface CustomPreviewProps {
  title?: string
  subtitle?: string
  media?: any
  status?: 'published' | 'draft'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  date?: string
}

export function CustomPreview({ 
  title, 
  subtitle, 
  media, 
  status = 'draft',
  priority,
  date 
}: CustomPreviewProps) {
  const statusColor = status === 'published' ? 'positive' : 'caution'
  const priorityColor = {
    low: 'default',
    normal: 'primary',
    high: 'caution',
    urgent: 'critical'
  }

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Flex align="center" gap={3}>
        {media && (
          <Box>
            {media}
          </Box>
        )}
        <Box flex={1}>
          <Text size={2} weight="semibold">
            {title || 'Untitled'}
          </Text>
          {subtitle && (
            <Text size={1} muted>
              {subtitle}
            </Text>
          )}
          <Flex gap={2} marginTop={2}>
            <Badge tone={statusColor} mode="outline">
              {status === 'published' ? 'Published' : 'Draft'}
            </Badge>
            {priority && priority !== 'normal' && (
              <Badge tone={priorityColor[priority]} mode="outline">
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
            )}
            {date && (
              <Text size={1} muted>
                {format(new Date(date), 'MMM dd, yyyy')}
              </Text>
            )}
          </Flex>
        </Box>
      </Flex>
    </Card>
  )
}