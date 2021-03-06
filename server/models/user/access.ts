import { isAuthenticated } from '@server/modules/access-rules';

/**
 * Access permissions for types and resolvers
 *
 * @returns {Object} - A Shield object for permission middleware
 */
export default {
  Mutation: {
    '*': isAuthenticated,
  },
  User: {
    '*': isAuthenticated,
  },
  UserAccount: {
    '*': isAuthenticated,
  },
};
