const faunadb = require("faunadb");
exports.handler = async (event) => {
  const contxt = process.env.CONTEXT;
  const q = faunadb.query;
  const client = new faunadb.Client({
    secret: process.env.FAUNA_API_KEY,
  });
  const data = JSON.parse(event.body);
  let index = "likes_by_slug";
  let db = "likes";

  if (contxt == "branch-deploy") {
    index = "likes_test_by_slug";
    db = "likes_test";
  }
  const slug = data.slug;
  if (!slug) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Article slug not provided",
      }),
    };
  }
  const doesDocExist = await client.query(
    q.Exists(q.Match(q.Index(index), slug))
  );

  if (!doesDocExist) {
    await client.query(
      q.Create(q.Collection(db), {
        data: { slug: slug, likes: 0 },
      })
    );
  }

  const document = await client.query(q.Get(q.Match(q.Index(index), slug)));

  return {
    statusCode: 200,
    body: JSON.stringify({
      likes: document.data.likes,
    }),
  };
};
