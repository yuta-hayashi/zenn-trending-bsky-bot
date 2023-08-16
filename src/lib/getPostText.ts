export default async function getPostText() {
  const res = await fetch('https://zenn-api.vercel.app/api/trendTech')
    .then((res) => res.json())
    .catch((err) => {
      throw new Error(err)
    })
  const article = res[0]
  return `${article.emoji} ${article.title}\nby ${article.user.name}\nhttps://zenn.dev${article.path}`
}
