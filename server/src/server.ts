import express from 'express';
import path from 'node:path';
import db from './config/connection.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas/index.js';
import { authMiddleware } from './services/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Create new Apollo server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the Apollo server before applying middleware
const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    // Serve the React app for any unknown routes in production
    app.get('*', (_, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
  }

  // Apply Apollo middleware with the auth context
  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  // Database connection listener
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`GraphQL ready at http://localhost:${PORT}/graphql`);
    });
  });
};

// Call the async function to start the server
startApolloServer().catch(err => {
  console.error('Error starting Apollo Server:', err);
});