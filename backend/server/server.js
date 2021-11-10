const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/issuetracker';

let db;

let aboutMessage = "Customer Info API v1.0";

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },
});

const resolvers = {
  Query: {
    about: () => aboutMessage,
    customerList,
  },
  Mutation: {
    setAboutMessage,
    customerAdd,
    customerDelete,
  },
  GraphQLDate,
};

function setAboutMessage(_, { message }) {
  return aboutMessage = message;
}

async function customerList() {
  const customers = await db.collection('customers').find({}).toArray();
  return customers;
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function removeSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: -1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}


function customerValidate(customer) {
  const errors = [];
  if (customer.name==""||customer.phone=="") {
    errors.push('You should enter the customer\'s name and phonenumber.');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}



async function customerAdd(_, { customer }) {
  customerValidate(customer)
  customer.timestamp = new Date();
  customer.id = await getNextSequence('customers');

  const result = await db.collection('customers').insertOne(customer);
  const savedCustomer = await db.collection('customers')
    .findOne({ _id: result.insertedId });
  return savedCustomer;
}

async function customerDelete(_, { customer }) {
  customerValidate(customer);
  const deleteone=await db.collection('customers').findOne({name:customer.name,phone:customer.phone});
  console.log(deleteone)
  const index=deleteone.id;
  await db.collection('customers').deleteOne({name:customer.name,phone:customer.phone});
  const number= await removeSequence('customers'); 
  await db.collection('customers').updateMany({id:{$gt:index}},{$inc:{id:-1}});

}

async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  },
});

const app = express();

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' });

(async function () {
  try {
    await connectToDb();
    app.listen(3000, function () {
      console.log('App started on port 3000');
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
})();