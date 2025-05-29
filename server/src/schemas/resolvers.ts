import User from '../models/User';
import { signToken } from '../services/auth';

const resolvers = {
  Query: {
    me: async (_: unknown, context: { user?: { _id: string } }) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('savedBooks');
      }
      throw new Error('Not logged in');
    },
  },
  Mutation: {
    addUser: async (_: unknown, { username, email, password }: { username: string; email: string; password: string }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },
    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new Error("Can't find this user");
      }
      
      const correctPw = await user.isCorrectPassword(password);
      
      if (!correctPw) {
        throw new Error('Wrong password!');
      }
      
      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },
    saveBook: async (_: unknown, { bookData }: { bookData: any }, context: { user?: { _id: string } }) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      }
      throw new Error('You need to be logged in!');
    },
    removeBook: async (_: unknown, { bookId }: { bookId: string }, context: { user?: { _id: string } }) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new Error('You need to be logged in!');
    },
  },
};

export default resolvers;