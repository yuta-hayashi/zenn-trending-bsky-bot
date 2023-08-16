import ogs from 'open-graph-scraper'
import sharp from 'sharp'

export const getOgp = async (url: string) => {
  // @ts-ignore
  const { result } = await ogs({ url: url })
  const res = await fetch(result.ogImage?.at(0)?.url || '')

  const buffer = await res.arrayBuffer()
  const compressedImage = await sharp(buffer)
    .resize(800, null, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 80,
      progressive: true,
    })
    .toBuffer()

  return {
    url: result.ogImage?.at(0)?.url || '',
    type: result.ogImage?.at(0)?.type || '',
    description: result.ogDescription || '',
    title: result.ogTitle || '',
    uint8Array: new Uint8Array(compressedImage),
  }
}
