
import fetch from 'node-fetch';
import Url from 'fast-url-parser';
import queryString from 'query-string';
import QueryStringParser from 'querystringparser';
import urlencode from 'urlencode';
Url.queryString = QueryStringParser;

const getToken = async (clientId, clientSecret) => {
    const authParams = {
        state: 'oauth2',
        client_id: clientId,
        scope: 'ACCOUNTS_BASIC,ACCOUNTS_BALANCES,ACCOUNTS_DETAILS,ACCOUNTS_TRANSACTIONS,PAYMENTS_MULTIPLE',
        duration: 1234,
        language: 'en',
        country: 'FI',
        max_tx_history: 12,
        redirect_uri: 'https://httpbin.org/get',
    };
    const authUrl = `https://api.nordeaopenbanking.com/v3/authorize?` + queryString.stringify(authParams);
    const accessTokenTemplate = 'https://api.nordeaopenbanking.com/v3/authorize/token';
    
    const response = await fetch(authUrl, {
        method: 'GET',
    });
    console.log('Authurl fetched');
    const parsed = new Url.parse(response.url, true);
    const code = parsed.query.code;
    const accessTokenResponse = await fetch(accessTokenTemplate, {
        method: 'POST',
        body: 'code=' + urlencode(code) + '&redirect_uri=https://httpbin.org/get',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-IBM-Client-Id': clientId,
            'X-IBM-Client-Secret': clientSecret,
        }
    });
    console.log('Tokens fetched');
    const token = await accessTokenResponse.json();
    return ({
        accessToken: token.access_token,
        clientId: clientId,
        clientSecret: clientSecret,
    });
}

const getGetHeaders = (token) => ({
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + token.accessToken,
        'X-IBM-Client-Id' : token.clientId,
        'X-IBM-Client-Secret' : token.clientSecret,
    }
})

const getAccounts = async (token) => {
    const accountsUrl = 'https://api.nordeaopenbanking.com/v3/accounts';

    const accountsResponse = await fetch(accountsUrl, getGetHeaders(token));
    const accounts = await accountsResponse.json();
    return accounts.response;
}

const getTransactions = async (token, accountId) => {
    const transactionsUrl = `https://api.nordeaopenbanking.com/v3/accounts/${accountId}/transactions`;
    const response = await fetch(transactionsUrl, getGetHeaders(token));
    return response.json();
}

const nordeaApiDemo = async (clientId, clientSecret) => {
    const token = await getToken(clientId, clientSecret);
    const accounts = await getAccounts(token);
    console.log(accounts.accounts);
    const transactions = await Promise.all(
        accounts.accounts.map(a => getTransactions(token, a.id)));
    return transactions;
}

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

if (CLIENT_ID === undefined || CLIENT_SECRET === undefined) {
    throw Error('Parameters missing');
}
nordeaApiDemo(CLIENT_ID, CLIENT_SECRET).then((tx) => console.log(tx));
