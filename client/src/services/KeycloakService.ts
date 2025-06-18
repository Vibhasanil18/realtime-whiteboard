import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8180/',
  realm: 'realtime-board',         
  clientId: 'realtime-client',     
});

const initKeycloak = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    keycloak
      .init({
        onLoad: 'login-required',
        checkLoginIframe: false,
        pkceMethod: 'S256',
      })
      .then((authenticated) => {
        if (authenticated) {
          console.log('Authenticated');
        } else {
          console.warn('Not authenticated');
        }
        resolve(authenticated);
      })
      .catch((error) => {
        console.error('Keycloak init error:', error);
        reject(error);
      });
  });
};

export { keycloak, initKeycloak };
