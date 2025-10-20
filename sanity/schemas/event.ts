import { defineField, defineType } from 'sanity'

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Event Title',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Detailed Information',
      type: 'array',
      of: [
        {
          type: 'block',
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
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date & Time',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date & Time',
      type: 'datetime',
      validation: (Rule) => Rule.min(Rule.valueOfField('startDate')),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Venue Name',
          type: 'string',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'address',
          title: 'Address',
          type: 'text',
          rows: 2,
        },
        {
          name: 'city',
          title: 'City',
          type: 'string',
        },
        {
          name: 'isOnline',
          title: 'Online Event',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'onlineLink',
          title: 'Online Meeting Link',
          type: 'url',
          hidden: ({ parent }) => !parent?.isOnline,
        },
      ],
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          { title: 'Community Meeting', value: 'meeting' },
          { title: 'Cultural Event', value: 'cultural' },
          { title: 'Fundraising', value: 'fundraising' },
          { title: 'Educational Workshop', value: 'workshop' },
          { title: 'Social Gathering', value: 'social' },
          { title: 'Religious Ceremony', value: 'religious' },
          { title: 'Sports Event', value: 'sports' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'registrationRequired',
      title: 'Registration Required',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'registrationLink',
      title: 'Registration Link',
      type: 'url',
      hidden: ({ parent }) => !parent?.registrationRequired,
    }),
    defineField({
      name: 'maxAttendees',
      title: 'Maximum Attendees',
      type: 'number',
      hidden: ({ parent }) => !parent?.registrationRequired,
    }),
    defineField({
      name: 'contactPerson',
      title: 'Contact Person',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Name',
          type: 'string',
        },
        {
          name: 'email',
          title: 'Email',
          type: 'email',
        },
        {
          name: 'phone',
          title: 'Phone',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Event',
      type: 'boolean',
      initialValue: false,
      description: 'Featured events appear prominently on the homepage',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      startDate: 'startDate',
      eventType: 'eventType',
      isPublished: 'isPublished',
      media: 'featuredImage',
    },
    prepare(selection) {
      const { title, startDate, eventType, isPublished, media } = selection
      const eventTypeEmoji = {
        meeting: '🏛️',
        cultural: '🎭',
        fundraising: '💰',
        workshop: '📚',
        social: '🎉',
        religious: '⛪',
        sports: '⚽',
        other: '📅',
      }
      
      return {
        title: `${eventTypeEmoji[eventType as keyof typeof eventTypeEmoji] || '📅'} ${title}`,
        subtitle: `${isPublished ? '✅ Published' : '📝 Draft'} • ${startDate ? new Date(startDate).toLocaleDateString() : 'No date'}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Start date, Newest first',
      name: 'startDateDesc',
      by: [{ field: 'startDate', direction: 'desc' }],
    },
    {
      title: 'Start date, Oldest first',
      name: 'startDateAsc',
      by: [{ field: 'startDate', direction: 'asc' }],
    },
  ],
})