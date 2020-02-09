const request = require('request');
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
console.log(webhookUrl);

const sendReport = report => {
  request.post({
      uri: webhookUrl,
      headers: {
          "Content-Type": "application/json"
      },
      json: {
          "content": "```" + report + "```"
      }
    }, error => {
      if (!error) {
        console.log(report)
      } else {
        request.post({
          uri: webhookUrl,
          headers: {
              "Content-Type": "application/json"
          },
          json: {
              "content": "エラーが発生しました"
          }
        }, null);
    }
  });
}

exports.handler = function(event, context, callback) {
    sendReport(event.body)
    callback(null, {
      statusCode: 200,
      body: 'Successfully'
    });
}