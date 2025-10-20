import { useState } from 'react'
import { Stack, Text, TextInput, Button, Flex } from '@sanity/ui'
import { CalendarIcon, ClockIcon } from '@sanity/icons'
import { set, unset } from 'sanity'

interface DateTimeInputProps {
  value?: string
  onChange: (patch: any) => void
  elementProps: any
}

export function DateTimeInput({ value, onChange, elementProps }: DateTimeInputProps) {
  const [localValue, setLocalValue] = useState(value || '')

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    if (newValue) {
      onChange(set(newValue))
    } else {
      onChange(unset())
    }
  }

  const setToNow = () => {
    const now = new Date().toISOString()
    handleChange(now)
  }

  const formatDisplayValue = (isoString: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Stack space={3}>
      <TextInput
        {...elementProps}
        value={localValue}
        onChange={(event) => handleChange(event.currentTarget.value)}
        placeholder="YYYY-MM-DDTHH:mm:ss.sssZ"
      />
      
      {localValue && (
        <Text size={1} muted>
          <CalendarIcon style={{ marginRight: 4 }} />
          {formatDisplayValue(localValue)}
        </Text>
      )}
      
      <Flex gap={2}>
        <Button
          mode="ghost"
          icon={ClockIcon}
          text="Set to now"
          onClick={setToNow}
          fontSize={1}
        />
        {localValue && (
          <Button
            mode="ghost"
            text="Clear"
            onClick={() => handleChange('')}
            fontSize={1}
            tone="critical"
          />
        )}
      </Flex>
    </Stack>
  )
}