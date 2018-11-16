# Nordea Open Banking API example

See more details at <https://developer.nordeaopenbanking.com>

AIS API definition: <https://raw.githubusercontent.com/NordeaOB/swaggers/master/ais-v2.json>
I&A API definition: <https://raw.githubusercontent.com/NordeaOB/swaggers/master/ia-v2.json>

## Usage

1. Install node 11.2.0

  ```bash
  nvm install 11.2.0
  ```

2. Set environment variables

  ```bash
  export CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  export CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```

3. Run

```bash
node --experimental-modules index.mjs
```

4. Result

```javascript
{ _continuationKey: '0220161114995957-2',
  transactions: 
   [ { _type: 'CreditTransaction',
       transactionId: '0220161114995957',
       currency: 'EUR',
       bookingDate: '2017-12-04',
       valueDate: '2017-12-04',
       typeDescription: 'Pano',
       amount: '8.79',
       debtorName: 'Firma OY' },
     { _type: 'DebitTransaction',
       transactionId: '0220161114995926',
       currency: 'EUR',
       bookingDate: '2017-12-04',
       valueDate: '2017-12-04',
       typeDescription: 'Korttiosto',
       amount: '-6.13',
       creditorName: 'K market Metsäkulma' },
       ....

```