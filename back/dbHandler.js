import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import settings from './settings.json' assert { type: "json"}

const { databaseIP, databasePort, databaseName } = settings

// Replace the placeholder with your connection string
const uri = `mongodb://${databaseIP}:${databasePort}/`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);

const insertStar = (star) => {
  const dbo = client.db(databaseName)
  const stars = dbo.collection('stars')
  console.log('insert deeper', star)
  
  return stars.insertOne(star).then((res) => {
    return res
  })
}

const deleteStar = (id) => {
  const dbo = client.db(databaseName)
  const stars = dbo.collection('stars')
  id = String(id).replace(/"/g, "")
  
  return stars.deleteOne( { "_id": new ObjectId(id)}).then((res) => {
    console.log('delete 2', res)
    return res
  })
}

const getStars = () => {
    const dbo = client.db(databaseName)
    let starsColl
    return dbo.collection('stars').find().toArray().then((res) => {
      return starsColl = res
    })
}

export { getStars, insertStar, deleteStar }