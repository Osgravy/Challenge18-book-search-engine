import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';

// Create the HTTP link for Apollo Client
const httpLink = createHttpLink({
  uri: '/graphql', // Your GraphQL endpoint
});

// Create auth link to include token in headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('id_token');
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Create the Apollo Client instance
const client = new ApolloClient({
  link: authLink.concat(httpLink), // Chain the auth and http links
  cache: new InMemoryCache(), // Cache implementation
});

function App() {
  return (
    <ApolloProvider client={client}>
    
        <Navbar />
        <Outlet />
  
    </ApolloProvider>
  );
}

export default App;