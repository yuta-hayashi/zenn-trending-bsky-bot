import { bskyAccount, bskyService } from "./config.js";
import type {
  AtpAgentLoginOpts,
  AtpAgentOpts,
  AppBskyFeedPost,
} from "@atproto/api";
import { getOgp } from './ogp.js'
import atproto from '@atproto/api'
const { BskyAgent, RichText } = atproto

type BotOptions = {
  service: string | URL
  dryRun: boolean
}

export default class Bot {
  #agent

  static defaultOptions: BotOptions = {
    service: bskyService,
    dryRun: false,
  } as const

  constructor(service: AtpAgentOpts['service']) {
    this.#agent = new BskyAgent({ service })
  }

  login(loginOpts: AtpAgentLoginOpts) {
    return this.#agent.login(loginOpts)
  }

  async post(
    text:
      | string
      | (Partial<AppBskyFeedPost.Record> &
          Omit<AppBskyFeedPost.Record, 'createdAt'>)
  ) {
    if (typeof text === 'string') {
      const richText = new RichText({ text })
      await richText.detectFacets(this.#agent)
      let embed = undefined

      if (richText.facets && richText.facets[0].features[0].uri) {
        const webPageUrl = String(richText.facets[0].features[0].uri)
        const ogp = await getOgp(webPageUrl)
        const ogImage = await this.#agent.uploadBlob(ogp.uint8Array, {
          encoding: 'image/jpeg',
        })
        embed = {
          $type: 'app.bsky.embed.external',
          external: {
            uri: webPageUrl,
            thumb: {
              $type: 'blob',
              ref: {
                $link: ogImage.data.blob.ref.toString(),
              },
              mimeType: ogImage.data.blob.mimeType,
              size: ogImage.data.blob.size,
            },
            title: ogp.title,
            description: ogp.description,
          },
        }
      }

      const record = {
        text: richText.text,
        facets: richText.facets,
        embed: embed,
      }
      return this.#agent.post(record)
    } else {
      return this.#agent.post(text)
    }
  }

  static async run(
    getPostText: () => Promise<string>,
    botOptions?: Partial<BotOptions>
  ) {
    const { service, dryRun } = botOptions
      ? Object.assign({}, this.defaultOptions, botOptions)
      : this.defaultOptions
    const bot = new Bot(service)
    await bot.login(bskyAccount)
    const text = await getPostText()
    if (!dryRun) {
      await bot.post(text)
    }
    return text
  }
}
