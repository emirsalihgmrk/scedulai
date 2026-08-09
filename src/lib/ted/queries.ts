export const VIDEO_QUERY = `
  query VideoBySlug($slug: String!) {
    video(slug: $slug) {
      id
      slug
      title
      description
      duration
      publishedAt
      recordedOn
      internalLanguageCode
      canonicalUrl
      presenterDisplayName
      speakers {
        nodes {
          firstname
          lastname
        }
      }
      primaryImageSet {
        url
        aspectRatioName
      }
    }
  }
`;

export const TRANSLATION_QUERY = `
  query Transcript($videoId: ID!, $language: String!) {
    translation(videoId: $videoId, language: $language) {
      paragraphs {
        cues {
          text
        }
      }
    }
  }
`;