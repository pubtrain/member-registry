import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const port = 3000;
const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');

//För att kunna läsa formulärdata så behövs en middleware

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./views'));

//Koppla ihop databasen med frontend

const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
const db = client.db('memberclub');
const membersCollection = db.collection('members');

//Gör medlemslistan till en array och visa den på sidan
app.get('/members', async (req, res) => {
  const members = await membersCollection.find({}).toArray();
  res.render('members', {
    members,
  });
});

app.get('/homepage', (req, res) => {
  res.render('homepage');
});

app.get('/details/:id', async (req, res) => {
  const member = await membersCollection.findOne({
    _id: ObjectId(req.params.id),
  });
  res.render('details', {
    name: member.name,
    email: member.email,
    phone: member.phone,
    createdAt: member.createdAt,
    description: member.description,
    _id: member._id,
  });
});

app.post('/members/create', async (req, res) => {
  await membersCollection.insertOne({
    ...req.body,
    createdAt: new Date().toISOString().slice(0, 10),
  });
  res.redirect('/members');
});

app.get('/create', (req, res) => {
  res.render('create');
});

app.get('/details/:id/delete', async (req, res) => {
  const memDel = await membersCollection.findOne({
    _id: ObjectId(req.params.id),
  });

  membersCollection.deleteOne(memDel);
  res.redirect('/members');
});

app.get('/members/sort/1', async (req, res) => {
  const members = await membersCollection.find({}).sort({ name: 1 }).toArray();
  res.render('members', {
    members,
  });
});
app.get('/members/sort/2', async (req, res) => {
  const members = await membersCollection.find({}).sort({ name: -1 }).toArray();
  res.render('members', {
    members,
  });
});

app.post('/details/update/:id', async (req, res) => {
  await membersCollection.updateOne(
    { _id: ObjectId(req.params.id) },
    {
      $set: {
        ...req.body,
      },
    }
  );
  res.redirect('/members');
});

//Sista raden, lyssna på porten
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
