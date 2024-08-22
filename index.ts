// Import required modules using CommonJS syntax
const { createYoga } = require('@graphql-yoga/node');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { createServer } = require('http');
const  { createSchema } = require('@graphql-yoga/node');

// Load environment variables from .env file
dotenv.config();

// Initialize the Supabase client with your Supabase project details
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

// Define the GraphQL schema
const typeDefs = `
  type User {
    id: ID!
    coins: Int!
  }

  type Query {
    user(id: ID!): User
  }

  type Mutation {
    updateUserBalance(userId: ID!, amount: Int!): User
  }
`;

// Define resolvers for the GraphQL schema
const resolvers = {
  Query: {
    user: async (_, { id }) => {
      // Check if the user exists
      const { data, error } = await supabase
        .from('users')
        .select('id, coins')
        .eq('id', id)
        .single();

      if (error && error.code === 'PGRST116') {
        // User not found, create a new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({ id, coins: 0 })
          .single();

        if (insertError) {
          throw new Error(`Failed to create user: ${insertError.message}`);
        }

        return newUser;
      }

      if (error) {
        throw new Error(`Error fetching user: ${error.message}`);
      }

      return data;
    },
  },
  Mutation: {
    updateUserBalance: async (_, { userId, amount }) => {
      // Fetch the user's current balance
      const { data, error } = await supabase
        .from('users')
        .select('coins')
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(`User with ID ${userId} not found: ${error.message}`);
      }

      const newBalance = data.coins + amount;

      // Update the user's balance
      const { data: updatedData, error: updateError } = await supabase
        .from('users')
        .update({ coins: newBalance })
        .eq('id', userId)
        .select('id, coins')
        .single();

      if (updateError) {
        throw new Error(`Failed to update balance: ${updateError.message}`);
      }

      return updatedData;
    },
  },
};

// Create and start the GraphQL server
const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
});

const httpServer = createServer(yoga);

httpServer.listen(4000, () => {
  console.log('GraphQL server is running on http://localhost:4000');
});
