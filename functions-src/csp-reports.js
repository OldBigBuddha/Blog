const request = require('request');

const sendReport = report => {
  request.post({
      uri: "https://discordapp.com/api/webhooks/675893097023930368/Qu710DZW80T6QUISwloY_p9qyKDSjIbqGPHxDqlC7eKVZ-o-NwySKTwXC06QFpTtJsQ2",
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
          uri: "https://discordapp.com/api/webhooks/675893097023930368/Qu710DZW80T6QUISwloY_p9qyKDSjIbqGPHxDqlC7eKVZ-o-NwySKTwXC06QFpTtJsQ2",
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