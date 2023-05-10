const admin = require('firebase-admin')
const fs = require('fs')
const serviceAccount = require('./service.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kingsoo-app-6c3c8-default-rtdb.firebaseio.com'
})

function flattenObject (ob) {
  const toReturn = {}

  for (const i in ob) {
    if (!ob.hasOwnProperty(i)) {
      continue
    }

    if (typeof ob[i] === 'object' && ob[i] !== null && !Array.isArray(ob[i])) {
      const flatObject = flattenObject(ob[i])
      for (const x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) {
          continue
        }

        toReturn[i + '.' + x] = flatObject[x]
      }
    } else if (Array.isArray(ob[i])) {
      const flatArray = ob[i].map((item) => {
        if (typeof item === 'object' && item !== null) {
          return flattenObject(item)
        }
        return item
      })

      toReturn[i] = flatArray.join(';')
    } else {
      toReturn[i] = ob[i]
    }
  }
  return toReturn
}

async function convertCollectionToCsv (collectionPath) {
  const collectionRef = admin.firestore().collection(collectionPath)
  const querySnapshot = await collectionRef.get()
  const documents = querySnapshot.docs.map((doc) => flattenObject(doc.data()))
  if (documents.length === 0) {
    console.log(`No documents found in ${collectionPath}`)
    return
  }
  const header = Object.keys(documents[0]).join(',') + '\n'
  const rows = documents.map((doc) => Object.values(doc).join(',')).join('\n')
  const csvData = header + rows
  const csvFilePath = './csv/' + collectionPath + '.csv'
  fs.mkdirSync('./csv', { recursive: true })
  fs.writeFileSync(csvFilePath, csvData)

  console.log(`Successfully converted ${collectionPath} to ${csvFilePath}`)
}

convertCollectionToCsv('jobs')
