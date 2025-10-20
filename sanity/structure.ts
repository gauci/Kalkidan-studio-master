import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content Management')
    .items([
      // Content Section
      S.listItem()
        .title('📰 Content')
        .child(
          S.list()
            .title('Content Types')
            .items([
              S.listItem()
                .title('📢 Announcements')
                .child(
                  S.documentTypeList('announcement')
                    .title('Announcements')
                    .filter('_type == "announcement"')
                    .defaultOrdering([
                      { field: 'priority', direction: 'desc' },
                      { field: 'publishedAt', direction: 'desc' }
                    ])
                ),
              S.listItem()
                .title('📅 Events')
                .child(
                  S.documentTypeList('event')
                    .title('Events')
                    .filter('_type == "event"')
                    .defaultOrdering([{ field: 'startDate', direction: 'desc' }])
                ),
              S.listItem()
                .title('📝 Articles')
                .child(
                  S.documentTypeList('article')
                    .title('Articles')
                    .filter('_type == "article"')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('📄 Pages')
                .child(
                  S.documentTypeList('page')
                    .title('Pages')
                    .filter('_type == "page"')
                    .defaultOrdering([{ field: 'title', direction: 'asc' }])
                ),
            ])
        ),

      S.divider(),

      // Published vs Draft Content
      S.listItem()
        .title('📊 Content Status')
        .child(
          S.list()
            .title('Content by Status')
            .items([
              S.listItem()
                .title('✅ Published Content')
                .child(
                  S.list()
                    .title('Published Content')
                    .items([
                      S.listItem()
                        .title('Published Announcements')
                        .child(
                          S.documentTypeList('announcement')
                            .title('Published Announcements')
                            .filter('_type == "announcement" && isPublished == true')
                            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                        ),
                      S.listItem()
                        .title('Published Events')
                        .child(
                          S.documentTypeList('event')
                            .title('Published Events')
                            .filter('_type == "event" && isPublished == true')
                            .defaultOrdering([{ field: 'startDate', direction: 'desc' }])
                        ),
                      S.listItem()
                        .title('Published Articles')
                        .child(
                          S.documentTypeList('article')
                            .title('Published Articles')
                            .filter('_type == "article" && isPublished == true')
                            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                        ),
                      S.listItem()
                        .title('Published Pages')
                        .child(
                          S.documentTypeList('page')
                            .title('Published Pages')
                            .filter('_type == "page" && isPublished == true')
                            .defaultOrdering([{ field: 'title', direction: 'asc' }])
                        ),
                    ])
                ),
              S.listItem()
                .title('📝 Draft Content')
                .child(
                  S.list()
                    .title('Draft Content')
                    .items([
                      S.listItem()
                        .title('Draft Announcements')
                        .child(
                          S.documentTypeList('announcement')
                            .title('Draft Announcements')
                            .filter('_type == "announcement" && isPublished != true')
                        ),
                      S.listItem()
                        .title('Draft Events')
                        .child(
                          S.documentTypeList('event')
                            .title('Draft Events')
                            .filter('_type == "event" && isPublished != true')
                        ),
                      S.listItem()
                        .title('Draft Articles')
                        .child(
                          S.documentTypeList('article')
                            .title('Draft Articles')
                            .filter('_type == "article" && isPublished != true')
                        ),
                      S.listItem()
                        .title('Draft Pages')
                        .child(
                          S.documentTypeList('page')
                            .title('Draft Pages')
                            .filter('_type == "page" && isPublished != true')
                        ),
                    ])
                ),
            ])
        ),

      S.divider(),

      // Organization
      S.listItem()
        .title('🏷️ Organization')
        .child(
          S.list()
            .title('Organization & Categories')
            .items([
              S.listItem()
                .title('Categories')
                .child(
                  S.documentTypeList('category')
                    .title('Categories')
                    .filter('_type == "category"')
                ),
            ])
        ),

      S.divider(),

      // Special Views
      S.listItem()
        .title('⭐ Featured Content')
        .child(
          S.list()
            .title('Featured Content')
            .items([
              S.listItem()
                .title('📌 Pinned Announcements')
                .child(
                  S.documentTypeList('announcement')
                    .title('Pinned Announcements')
                    .filter('_type == "announcement" && isPinned == true')
                ),
              S.listItem()
                .title('🌟 Featured Events')
                .child(
                  S.documentTypeList('event')
                    .title('Featured Events')
                    .filter('_type == "event" && isFeatured == true')
                ),
              S.listItem()
                .title('🧭 Navigation Pages')
                .child(
                  S.documentTypeList('page')
                    .title('Navigation Pages')
                    .filter('_type == "page" && showInNavigation == true')
                    .defaultOrdering([{ field: 'navigationOrder', direction: 'asc' }])
                ),
            ])
        ),
    ])