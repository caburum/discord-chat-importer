const json = require('./messages.json'); // https://github.com/Tyrrrz/DiscordChatExporter

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}`);

	var channel = await client.channels.fetch(process.env.target_channel);
	var webhook;

	await channel.fetchWebhooks()
		.then(webhooks => {
			webhook = webhooks.find(hook => hook.owner.id === client.user.id);

			if (!webhook) {
				webhook = channel.createWebhook('Chat Import', {
					avatar: client.user.displayAvatarURL({ dynamic: true }),
				});
			}
		});

	var i = 0;
	sendMessage(json.messages[0], webhook);

	async function sendMessage(message, webhook) {
		let attachments = [];
		if (message.attachments.length > 0) {
			message.attachments.forEach((attachment) => {
				attachments.push(attachment.url);
			});
		}

		let content = message.content;
		if (message.reference) {
			content = `**[Replying](<https://discord.com/channels/${message.reference.guildId}/${message.reference.channelId}/${message.reference.messageId}>)**\n` + content
		}

		await webhook.send(content, {
			username: message.author.name,
			avatarURL: message.author.avatarUrl,
			files: attachments
		});

		console.log(i + 1 + '/' + json.messages.length);

		await sleep(2500);
		i++;
		sendMessage(json.messages[i], webhook)
	};
});

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

client.login(process.env.token);