import { DocumentActionComponent, useDocumentOperation } from 'sanity'
import { useState } from 'react'
import { CalendarIcon } from '@sanity/icons'

export const SchedulePublishAction: DocumentActionComponent = (props) => {
  const { patch } = useDocumentOperation(props.id, props.type)
  const [isScheduling, setIsScheduling] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)

  const handleSchedule = async (scheduledDate: string) => {
    setIsScheduling(true)
    
    try {
      // Set scheduled publish date
      patch.execute([
        { set: { scheduledPublishAt: scheduledDate } },
        { set: { isPublished: false } }, // Keep as draft until scheduled time
      ])
      
      setShowScheduleDialog(false)
      props.onComplete()
    } catch (error) {
      console.error('Scheduling failed:', error)
    } finally {
      setIsScheduling(false)
    }
  }

  const scheduledDate = props.draft?.scheduledPublishAt || props.published?.scheduledPublishAt
  const isAlreadyScheduled = !!scheduledDate

  return {
    label: isAlreadyScheduled ? 'Reschedule' : 'Schedule Publish',
    icon: CalendarIcon,
    disabled: isScheduling,
    shortcut: 'Ctrl+Shift+S',
    dialog: showScheduleDialog && {
      type: 'modal',
      onClose: () => setShowScheduleDialog(false),
      content: (
        <ScheduleDialog
          currentDate={scheduledDate}
          onSchedule={handleSchedule}
          onCancel={() => setShowScheduleDialog(false)}
        />
      ),
    },
    onHandle: () => setShowScheduleDialog(true),
  }
}

function ScheduleDialog({ 
  currentDate, 
  onSchedule, 
  onCancel 
}: {
  currentDate?: string
  onSchedule: (date: string) => void
  onCancel: () => void
}) {
  const [selectedDate, setSelectedDate] = useState(
    currentDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  )

  return (
    <div style={{ padding: 20 }}>
      <h3>Schedule Publication</h3>
      <p>Choose when this content should be automatically published:</p>
      
      <input
        type="datetime-local"
        value={selectedDate.slice(0, 16)}
        onChange={(e) => setSelectedDate(e.target.value + ':00.000Z')}
        min={new Date().toISOString().slice(0, 16)}
        style={{ 
          width: '100%', 
          padding: 8, 
          margin: '10px 0',
          border: '1px solid #ccc',
          borderRadius: 4 
        }}
      />
      
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button
          onClick={() => onSchedule(selectedDate)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2276fc',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Schedule
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f1f3f6',
            border: '1px solid #ddd',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}