db.customers.remove({});

const customersDB = [
    {id: 1,name: "Alice",phone:"11111111",timestamp:new Date('2021-01-11'),},
    {id: 2,name: "Bob",phone:"22222222",timestamp:new Date('2021-02-28'),}
];

db.customers.insertMany(customersDB);
const count = db.customers.count();
print('Inserted', count, 'customers');

db.counters.remove({ _id: 'customers' });
db.counters.insert({ _id: 'customers', current: count });

db.customers.createIndex({ id: 1 }, { unique: true });
db.customers.createIndex({ phone: 1 });
db.customers.createIndex({ name: 1 });
db.customers.createIndex({ timestamp: 1 });
