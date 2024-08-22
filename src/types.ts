export type User = {
    id: string;
    coins: number;
  };
  
  export type Query = {
    user: (parent: any, args: { id: string }) => Promise<User>;
  };
  
  export type Mutation = {
    updateUserBalance: (parent: any, args: { userId: string; amount: number }) => Promise<User>;
  };
  
  export type Resolvers = {
    Query: Query;
    Mutation: Mutation;
  };
  