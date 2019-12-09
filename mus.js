const Discord = require('discord.js');
const {
	prefix,
    token,
    GIPHYtoken,
} = require('./mus-config.json');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg');
const client = new Discord.Client();
const GphApiClient = require('giphy-js-sdk-core');
const Giphy = GphApiClient(GIPHYtoken);
const queue = new Map();



client.once('ready', () => {
	console.log('Ready!');
	client.user.setActivity('"! help" for help ', { type: 'WATCHING' })
  .then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`))
  .catch(console.error);
});

client.on("ready", () => {
	// This event will run if the bot starts, and logs in, successfully.
	console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
	// Example of changing the bot's playing game to something useful. `client.user` is what the
	// docs refer to as the "ClientUser".

	//client.user.setActivity(`Serving ${client.guilds.size} servers`);
  });
  
  client.on("guildCreate", guild => {
	// This event triggers when the bot joins a guild.
	console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
	client.user.setActivity(`Serving ${client.guilds.size} servers`);
  });
  
  client.on("guildDelete", guild => {
	// this event triggers when the bot is removed from a guild.
	console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
	client.user.setActivity(`Serving ${client.guilds.size} servers`);
  });
client.once('reconnecting', () => {
	console.log('Reconnecting!');
});

client.once('disconnect', () => {
	console.log('Disconnect!');
});

client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);
    const voiceChannel = message.member.voiceChannel;
    const args = message.content.slice(prefix).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

	if (message.content.startsWith(`${prefix}play`)) {
		execute(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}skip`)) {
		skip(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}stop`)) {
		stop(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}join`)) {
        voiceChannel.join()
     .then(connection => console.log('Connected!'))
        .catch(console.error);
    } else if (message.content.startsWith(`${prefix}leave`)) {
        voiceChannel.leave()
    } else if (message.content.startsWith(`${prefix}help`)){
        const helpEmbed = new Discord.RichEmbed()
	 .setColor('GREEN')
     .setTitle('help menu')
 	 .setURL('http://www.unboxingman.com')
	 .setAuthor('un boxing man', 'http://unpix.nwpixs.com/unboxingman%20logo%201.1.png', 'http://www.unboxingman.com')
	 .setDescription('un boxing bots help menu')
	 .setThumbnail('http://unpix.nwpixs.com/unboxingman%20logo%201.1.png')
	 .addField('!play (url)', 'plays song(url).')
	 .addField('!stop','stops the song.')
	 .addField('!join', 'joins the voice channel.', true)
	 .addField('!leave', 'leaves the voice channel.', true)
     .addField('!skip', 'skips the song.', true)
     .addField('!gif (the gif you want)','gets gif of your choice')
	 .addField('!help','help menu you are hear.')
	 .setTimestamp()
     .setFooter('made by un boxing man', 'http://unpix.nwpixs.com/unboxingman%20logo%201.1.png');
     message.channel.send(helpEmbed);  

    }else if (message.content.startsWith(`${prefix}gif`)) { 
        var input = message.content;
       var userInput= input.substr('5');
       Giphy.search ('gifs' , {"q":userInput})
       .then((Response) => {
         var totalresponses = Response.data.length;
         var Responseindex = Math.floor((Math.random() * 10) + 1) % totalresponses;
         var Responsefinal = Response.data[Responseindex];
   
		 
         message.channel.send("",{
           files: [Responsefinal.images.fixed_height.url]
         })}) 
		} else if (message.content.startsWith(`${prefix}say`)){   //(command === "say") {
			// makes the bot say something and delete the message. As an example, it's open to anyone to use. 
			// To get the "message" itself we join the `args` back into a string with spaces: 
			const sayMessage = args.join(" ");
			// Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
			message.delete().catch(O_o=>{}); 
			// And we get the bot to say the thing: 
			message.channel.send(sayMessage);
		  

    } else {
		message.channel.send('You need to enter a valid command!\ntry !help')
	}
});


async function execute(message, serverQueue) {
	const args = message.content.split(' ');

	const voiceChannel = message.member.voiceChannel;
	if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('I need the permissions to join and speak in your voice channel!');
	}

	const songInfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songInfo.title,
		url: songInfo.video_url,
	};

	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send(`${song.title} has been added to the queue!`);
	}

}

function skip(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
	if (!serverQueue) return message.channel.send('There is no song that I could skip!');
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		//serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', () => {
			console.log('Music ended!');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

client.login(token);