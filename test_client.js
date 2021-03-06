import _ from 'lodash';
import fs from 'fs';
import request from 'request';
import rp from 'request-promise';

const data = fs.readFileSync('input.txt');
let teamNames = data.toString().split('\n');
teamNames = _.chain(teamNames)
  .filter(teamName => teamName.length > 1)
  .value();


function teamPredictionRequest(teamName) {
  var options = {
      method: 'POST',
      uri: 'http://localhost:3000/api/v1/teams/winning_chance.json',
      form: {
        'team[name]': teamName
      },
      headers: {
      }
  };
  return rp(options);
}

const teamPredictionRequests = _.map(teamNames, (teamNames) => teamPredictionRequest(teamNames))
// from my observations, unfortunately, Rails backend hangs after more than 4 async requests
// FYI: https://github.com/puma/puma/issues/1085
Promise.all(_.take(teamPredictionRequests, 4)).then((results) => {
  console.log('all done');
  console.log('Promise.all results', results);
  const concatenatedResult = _.chain(results)
    .map((result) => JSON.parse(result))
    .map((resultObject) => resultObject.winning_chance > 50)
    .map((resultIsWinOrLost) => resultIsWinOrLost ? 'T' : 'F')
    .join('')
    .value();
  console.log('concatenatedResult', concatenatedResult);
}).catch(reason => {
  console.log('reason', reason)
});
