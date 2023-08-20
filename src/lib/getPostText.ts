export default async function getPostText() {
  const apiUrls = [
    'https://zenn-api.vercel.app/api/trendTech',
    'https://zenn-api.vercel.app/api/trendIdea',
    'https://zenn-api.vercel.app/api/trendBook',
  ]

  const promises = apiUrls.map((url) => fetch(url))
  const res = await Promise.all(promises)
    .then((responses) => Promise.all(responses.map((res) => res.json())))
    .catch((err) => {
      throw new Error(err)
    })

  const articles = res.flat()
  const article = articles[Math.floor(Math.random() * articles.length)]
  const emoji = article.emoji ? article.emoji : '📚'
  return `${emoji} ${article.title}\nby ${article.user.name}\nhttps://zenn.dev${article.path}`
}
