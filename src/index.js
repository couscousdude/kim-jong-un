const fs = require('fs');
const Discord = require('discord.js');
const { token, prefix } = require('./config.json');

const toxicity = require('@tensorflow-models/toxicity');
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-node');

const client = new Discord.Client();

const labelsToInclude = ['identity_attack', 'insult', 'threat', 'severe_toxicity', 'obscene', 'sexual_explicit'];
const threshold = 0.6;
let model;

(async () => {
    model = await toxicity.load(threshold, labelsToInclude);
    console.log('Model is ready');
})();

async function classify(textArr) {
    if (model) {
        try {
            const res = await model.classify(textArr);
            return res;
        } catch (error) {
            console.log(`An error occurred: ${error}`);
        }
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('over the motherland', { type: 'WATCHING' });
});

client.on('message', message => {
    const nameRegex = /cous|cos|cuos|csuo|csou/gi;

    if (nameRegex.test(message.content)) {
        message.reply('ANALYZING YOUR MESSAGE FOR DISAGREEABLE STATEMENTS');
        let msg = message.content.replace(nameRegex, 'you');
        classify([msg])
        .then(results => {
            let matches = [];
            let response = '';
            results.forEach(result => {
                if (result.results[0].match) {
                    // message.channel.send('i hate u die');
                    matches.push(result.label);
                }
            });
            matches.forEach((match, index) => {
                if (matches.length === 1) { 
                    response += `${match.toUpperCase()}` 
                } else if (index === matches.length - 1) { 
                    response += ` and ${match.toUpperCase()}` 
                } else { response += `${match.toUpperCase()},` }
            });
            if (matches.length) {
                message.reply(`${response} ${matches.length > 1 ? 'WERE' : 'WAS'} DETECTED. THIS INCIDENT WILL BE REPORTED`);
            } else {
                message.reply('no disagreeable information detected.');
            }
        })
        .catch(error => {
            console.log(`An error occurred: ${error}`);
        });
    }
});

client.login(token);
