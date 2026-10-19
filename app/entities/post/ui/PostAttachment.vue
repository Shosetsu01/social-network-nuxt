<script setup lang="ts">
import type { PostAttachment as Attachment } from '#shared/types/post'
import { SoundByteCard } from '@shared/ui'
import AttachmentGallery from './attachments/AttachmentGallery.vue'
import AttachmentImage from './attachments/AttachmentImage.vue'
import AttachmentVideo from './attachments/AttachmentVideo.vue'

interface Props {
  attachment: Attachment
  isEager?: boolean
}

const props = withDefaults(defineProps<Props>(), { isEager: false })

// A switch over the union (not a v-if chain) so that a new attachment type fails type-checking until it is rendered.
const content = computed(() => {
  const { attachment, isEager } = props
  switch (attachment.type) {
    case 'image':
      return h(AttachmentImage, { image: attachment.image, isEager })
    case 'gallery':
      return h(AttachmentGallery, { images: attachment.images, isEager })
    case 'video':
      return h(AttachmentVideo, { poster: attachment.poster, isEager })
    case 'sound-byte': {
      const { title, tag, publishedAt } = attachment.soundByte
      return h(SoundByteCard, { title, tag, publishedAt })
    }
    default:
      return assertNever(attachment)
  }
})

function assertNever(value: never): never {
  throw new Error(`Unsupported post attachment: ${JSON.stringify(value)}`)
}
</script>

<template>
  <component :is="content" />
</template>
