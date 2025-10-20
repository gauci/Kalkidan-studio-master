import { DocumentActionComponent, useDocumentOperation } from 'sanity'
import { useState } from 'react'
import { CheckmarkIcon, PublishIcon } from '@sanity/icons'

export const PublishAction: DocumentActionComponent = (props) => {
  const { patch, publish } = useDocumentOperation(props.id, props.type)
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublish = async () => {
    setIsPublishing(true)
    
    try {
      // Set published status and timestamp
      patch.execute([
        { set: { isPublished: true } },
        { set: { publishedAt: new Date().toISOString() } }
      ])
      
      // Publish the document
      publish.execute()
      
      props.onComplete()
    } catch (error) {
      console.error('Publishing failed:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const isAlreadyPublished = props.draft?.isPublished || props.published?.isPublished

  return {
    label: isAlreadyPublished ? 'Update & Publish' : 'Publish',
    icon: isAlreadyPublished ? CheckmarkIcon : PublishIcon,
    disabled: isPublishing || publish.disabled,
    shortcut: 'Ctrl+Shift+P',
    onHandle: handlePublish,
  }
}

export const UnpublishAction: DocumentActionComponent = (props) => {
  const { patch } = useDocumentOperation(props.id, props.type)
  const [isUnpublishing, setIsUnpublishing] = useState(false)

  const handleUnpublish = async () => {
    setIsUnpublishing(true)
    
    try {
      // Set unpublished status
      patch.execute([
        { set: { isPublished: false } }
      ])
      
      props.onComplete()
    } catch (error) {
      console.error('Unpublishing failed:', error)
    } finally {
      setIsUnpublishing(false)
    }
  }

  const isPublished = props.draft?.isPublished || props.published?.isPublished

  if (!isPublished) {
    return null
  }

  return {
    label: 'Unpublish',
    icon: () => '📝',
    disabled: isUnpublishing,
    tone: 'caution',
    onHandle: handleUnpublish,
  }
}