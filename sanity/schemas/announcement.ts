import { defineField, defineType } from 'sanity'

export const announcement = defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required().max(200),
      description: 'Brief summary shown in announcement lists',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for SEO and accessibility.',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Normal', value: 'normal' },
          { title: 'High', value: 'high' },
          { title: 'Urgent', value: 'urgent' },
        ],
        layout: 'radio',
      },
      initialValue: 'normal',
    }),
    defineField({
      name: 'targetAudience',
      title: 'Target Audience',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'All Members', value: 'all' },
          { title: 'Board Members', value: 'board' },
          { title: 'Committee Members', value: 'committee' },
          { title: 'Volunteers', value: 'volunteers' },
          { title: 'Donors', value: 'donors' },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'attachments',
      title: 'Attachments',
      type: 'array',
      of: [
        {
          type: 'file',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'File Title',
            },
            {
              name: 'description',
              type: 'text',
              title: 'Description',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      description: 'Optional: When this announcement should no longer be displayed',
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isPinned',
      title: 'Pin to Top',
      type: 'boolean',
      initialValue: false,
      description: 'Pinned announcements appear at the top of the list',
    }),
    defineField({
      name: 'scheduledPublishAt',
      title: 'Scheduled Publish Date',
      type: 'datetime',
      description: 'When this announcement should be automatically published',
      hidden: ({ document }) => document?.isPublished,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      priority: 'priority',
      publishedAt: 'publishedAt',
      isPublished: 'isPublished',
    },
    prepare(selection) {
      const { title, priority, publishedAt, isPublished } = selection
      const priorityEmoji = {
        urgent: '🚨',
        high: '⚠️',
        normal: '📢',
        low: '💬',
      }
      
      return {
        title: `${priorityEmoji[priority as keyof typeof priorityEmoji] || '📢'} ${title}`,
        subtitle: `${isPublished ? '✅ Published' : '📝 Draft'} • ${publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date'}`,
      }
    },
  },
  orderings: [
    {
      title: 'Priority, Newest first',
      name: 'priorityDesc',
      by: [
        { field: 'priority', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' },
      ],
    },
    {
      title: 'Published date, Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
})