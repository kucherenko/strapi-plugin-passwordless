'use strict';

const _ = require('lodash');

/**
 * Throws an ApolloError if context body contains a bad request
 * @param contextBody - body of the context object given to the resolver
 * @throws ApolloError if the body is a bad request
 */
function checkBadRequest(contextBody) {
  if (_.get(contextBody, 'statusCode', 200) !== 200) {
    const message = _.get(contextBody, 'error', 'Bad Request');
    const exception = new Error(message);
    exception.code = _.get(contextBody, 'statusCode', 400);
    exception.data = contextBody;
    throw exception;
  }
}

module.exports = {
  definition: /* GraphQL */ `
    type PasswordlessMe {
      id: ID!
      username: String!
      email: String!
      confirmed: Boolean
      blocked: Boolean
      role: PasswordlessMeRole
    }

    type PasswordlessMeRole {
      id: ID!
      name: String!
      description: String
      type: String
    }

    type PasswordlessLoginPayload {
      jwt: String
      user: PasswordlessMe!
    }

    type PasswordlessSendLinkPayload {
      email: String
      sent: String
    }
  `,
  query: ``,
  mutation: `
    sendLoginLink(email: String): PasswordlessSendLinkPayload!
    loginPasswordless(loginToken: String): PasswordlessLoginPayload!
  `,
  resolver: {
    Mutation: {
      sendLoginLink: {
        description: 'Send link for login to email',
        resolverOf: 'plugins::passwordless.auth.sendLink',
        resolver: async (obj, options, { context }) => {
          context.request.body = _.toPlainObject(options);
          await strapi.plugins['passwordless'].controllers.auth.sendLink(context);
          let output = context.body.toJSON ? context.body.toJSON() : context.body;

          checkBadRequest(output);
          return output;
        },
      },
      loginPasswordless: {
        resolverOf: 'plugins::passwordless.auth.login',
        resolver: async (obj, options, { context }) => {
          context.request.query.loginToken = options.loginToken;

          await strapi.plugins['passwordless'].controllers.auth.login(context);
          let output = context.body.toJSON ? context.body.toJSON() : context.body;

          checkBadRequest(output);
          return {
            user: output.user || output,
            jwt: output.jwt,
          };
        },
      },
    },
  },
};
