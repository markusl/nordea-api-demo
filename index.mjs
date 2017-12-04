
import fetch from 'node-fetch';
import Url from 'fast-url-parser';
import QueryStringParser from 'querystringparser';
import urlencode from 'urlencode';
Url.queryString = QueryStringParser;

const getToken = (clientId, clientSecret) => {
    const authUrlTemplate = 'https://api.nordeaopenbanking.com/v1/authentication?client_id=CLIENT_ID&redirect_uri=https://httpbin.org/post&X-Response-Scenarios=AuthenticationSkipUI&state=';
    const accessTokenTemplate = 'https://api.nordeaopenbanking.com/v1/authentication/access_token';
    
    const authUrl = authUrlTemplate.replace('CLIENT_ID', clientId);

    return fetch(authUrl)
        .then(response => {
            const parsed = new Url.parse(response.url, true);
            return parsed.query.code;
        })
        .then(code => fetch(accessTokenTemplate, {
                method: 'POST',
                body: 'code=' + urlencode(code) + '&redirect_uri=https://httpbin.org/post',
                headers: {
                    'Content-Type' :'application/x-www-form-urlencoded',
                    'X-IBM-Client-Id' : clientId,
                    'X-IBM-Client-Secret' : clientSecret,
                }
            }))
        .then(response => response.json())
        .then(response => ({
            accessToken: response.access_token,
            clientId: clientId,
            clientSecret: clientSecret,
        }));
}

const getGetHeaders = (token) => ({
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + token.accessToken,
        'X-IBM-Client-Id' : token.clientId,
        'X-IBM-Client-Secret' : token.clientSecret,
    }
})

const getAccounts = (token) => {
    const accountsUrl = 'https://api.nordeaopenbanking.com/v2/accounts';

    return fetch(accountsUrl, getGetHeaders(token))
        .then(response => response.json())
        .then(response => ({
            token: token,
            response: response.response,
        }));
}

const getTransactions = (token, accountId) => {
    const transactionsUrlTemplate = 'https://api.nordeaopenbanking.com/v2/accounts/{ACCOUNT-ID}/transactions';
    
    return fetch(
            transactionsUrlTemplate.replace('{ACCOUNT-ID}', accountId),
             getGetHeaders(token))
        .then(response => {
            return response.json();
        });
}

const nordeaApiDemo = (clientId, clientSecret) => {
    getToken(clientId, clientSecret)
        .then(token => getAccounts(token))
        .then(response => {
            console.log(response.response.accounts);
            //return Promise.all(response.response.accounts.map(a => getTransactions(response.token, a._id)));
            // For some reason, it currently fails if you try to fetch accounts[1]
            return getTransactions(response.token, response.response.accounts[0]._id);
        })
        .then(transactions => console.log(transactions.response))
        .catch(e => console.log(e));
}

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
nordeaApiDemo(CLIENT_ID, CLIENT_SECRET);
