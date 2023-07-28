#🥷 Mmry

A simple, lightweight, and easy-to-use memory cache library for TypeScript/JavaScript.

## Installation

To install Mmry, use npm or yarn:

```sh
npm install mmry

# or

yarn add mmry
```

## Usage
```ts
import Mmry from 'mmry';

// Create a new instance of the Mmry class with a string type parameter
const cache = new Mmry<string>();

// Add a value to the cache with a TTL of 5 minutes
cache.put('myKey', 'myValue', '5 minutes');

// Retrieve a value from the cache
const value = cache.get('myKey');

// Remove a value from the cache
cache.del('myKey');

// Retrieve all key-value pairs from the cache
const allItems = cache.getAll();

// Remove all values from the cache
cache.clearAll();
```
## Real-world example

Here's an example of how you could use Mmry with the [Express](https://expressjs.com/) web framework:
```ts
import express, { Request, Response } from 'express';
import Mmry from 'mmry';

// Define the types for the data and the cache
type User = {
  id: number;
  name: string;
};

type Cache = {
  users: User[];
};

// Create a new instance of the Mmry class with the Cache type
const cache = new Mmry<Cache>();

const app = express();

app.get('/api/users', async (req: Request, res: Response) => {
  const cachedUsers = cache.get('users');

  if (cachedUsers) {
    // Return cached users
    return res.json(cachedUsers);
  }

  // Fetch users from database
  const users = await fetchUsersFromDatabase();

  // Cache users for 5 minutes
  cache.put('users', users, '5 minutes');

  // Return fetched users
  res.json(users);
});

async function fetchUsersFromDatabase(): Promise<User[]> {
  // Fetch users from database
  return [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Bob Johnson' },
  ];
}

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

