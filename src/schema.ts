import { createServer } from '@graphql-yoga/node';
import { createClient } from '@supabase/supabase-js';
import { createSchema } from 'graphql-yoga';

// Initialize the Supabase client with your Supabase project details
const supabase = createClient(, '<SUPABASE_ANON_KEY>');

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
    user: async (_: any, { id }: { id: string }) => {
      const { data, error } = await supabase
        .from('users')
        .select('id, coins')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`User with ID ${id} not found: ${error.message}`);
      }

      return data;
    },
  },
  Mutation: {
    updateUserBalance: async (_: any, { userId, amount }: { userId: string, amount: number }) => {
      const { data, error } = await supabase
        .from('users')
        .select('coins')
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(`User with ID ${userId} not found: ${error.message}`);
      }

      const newBalance = data.coins + amount;

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
const server = createServer({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
});

// Start the server
server.start(() => {
  console.log('GraphQL server is running on http://localhost:4000');
});
