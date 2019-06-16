import React, { Component } from 'react';
import Router from 'next/router';
import * as queries from '@client/apollo/graphql/queries.graphql';

const withAuthentication = (WrappedComponent): any => {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';

  return class WithAuthentication extends Component {
    public static displayName = `WithAuthentication(${displayName})`;
    public static async getInitialProps(context): Promise<any> {
      const { apolloClient, res } = context;
      let appProps = {};

      const {
        data: { isAuthenticated },
      } = await apolloClient.query({
        query: queries.getCacheApp,
      });

      if (!isAuthenticated) {
        if (res) {
          res.writeHead(303, { Location: '/login' });
          res.end();
        } else {
          Router.replace('/login');
        }
      }

      if (WrappedComponent.getInitialProps) {
        appProps = await WrappedComponent.getInitialProps(context);
      }

      return { ...appProps };
    }

    public render(): any {
      return <WrappedComponent {...this.props} />;
    }
  };
};

export default withAuthentication;