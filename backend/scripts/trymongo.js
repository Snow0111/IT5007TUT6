const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/issuetracker';

async function testWithAsync() {
    console.log('\n--- testWithAsync ---');
    const client = new MongoClient(url, { useNewUrlParser: true });
    try {
      await client.connect();
      console.log('Connected to MongoDB');
      const db = client.db();
      const collection = db.collection('employees');

    //insert and read an item
      console.log('\n---Insert an item---');
      var employee = { id: 2, name: 'Zhong Xiaoxue', age: 16 };
      var result = await collection.insertOne(employee);
      console.log('Result of insert:\n', result.insertedId);
      var docs = await collection.find({ _id: result.insertedId }).toArray();
      console.log('Result of inserted item:\n', docs);
      
    
    //insert more than one item
      console.log('\n---insert more than one item---');
      var result = await collection.insertMany([{ id: 3, name: 'Alice', age: 65 },
        { id: 4, name: 'Bill', age: 39 }]);
      console.log('Result of insert:\n', result.insertedIds);
      var docs = await collection.find({ _id: {$gte:result.insertedIds[0] }}).toArray();
      console.log('Result of inserted item:\n', docs);
      
      
    //read the item of id=2
    console.log('\n---find an item---');
    var docs = await collection.find({ id: 2}).toArray();
    console.log('Result of find:\n', docs);
    
      
    //delete an item
    console.log('\n---delete an item---');
    await collection.deleteOne({ id: 3})
    var docs = await collection.find().toArray();
    console.log('Result of delete:\n', docs);
    
    //delete an item
    console.log('\n---update an item---');
    await collection.updateOne({ id: 2},{$set:{name:"Bilibili"}})
    var docs = await collection.find({ id: 2}).toArray();
    console.log('Result of updated item:\n', docs);

    } catch(err) {
      console.log(err);
    } finally {
      client.close();
    }
  }

function testWithCallbacks(callback) {
  console.log('\n--- testWithCallbacks ---');
  const client = new MongoClient(url, { useNewUrlParser: true });
  client.connect(function(err, client) {
    if (err) {
      callback(err);
      return;
    }
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('employees');
    collection.drop()

    const employee = { id: 1, name: 'Bob', age: 23 };
    collection.insertOne(employee, function(err, result) {
      if (err) {
        client.close();
        callback(err);
        return;
      }
      console.log('Result of insert:\n', result.insertedId);
      collection.find({ _id: result.insertedId})
        .toArray(function(err, docs) {
        if (err) {
          client.close();
          callback(err);
          return;
        }
        console.log('Result of inserted item:\n', docs);
        client.close();
        callback(err);
      });
    });
  });
}



testWithCallbacks(function(err) {
  if (err) {
    console.log(err);
  }
  testWithAsync();
});