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
const express = require('express');
const app = express();
const mysql = require('mysql');
const mysqlconnect = mysql.createConnection({
	host: '',
	user: 'unboxingbot',
	password: 'D5Fg9DOgo6XZjl5g',
	database: 'unboxingbot'
});
const queue = new Map();

//mysqlconnect.connect(Function(error) {
//	} (!!error) {
//		console.log('error'),
//	} else {
//		console.log('connected');
//	}
//});
//app.get('/', function(req, resp) {
//	connection.query("select * from unboxingbot", function(error, rows, fields)
//	if (condition) {
//		
	//}
//)}
//app.listen(3306);


client.once('ready', () => {
	console.log('Ready!');
	client.user.setActivity('"u!help" for help ', { type: 'WATCHING' })
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
	client.user.setActivity('"!help" for help ', { type: 'WATCHING' });
  });
  
  client.on("guildDelete", guild => {
	// this event triggers when the bot is removed from a guild.
	console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
	client.user.setActivity('"!help" for help ', { type: 'WATCHING' });
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
	 .setAuthor('un boxing bot', 'http://unpix.nwpixs.com/unboxingman%20logo%201.1.png', 'http://www.unboxingman.com')
	 .setDescription('un boxing bots help menu')
	 .setThumbnail('http://unpix.nwpixs.com/unboxingman%20logo%201.1.png')
	 .addField('!play (you tube url)', 'plays song(you tube url).')
	 .addField('!stop','stops the song.')
	 .addField('!join', 'joins the voice channel.', true)
	 .addField('!leave', 'leaves the voice channel.', true)
     .addField('!skip', 'skips the song.', true)
     .addField('!gif (the gif you want)','gets gif of your choice')
	 .addField('!help','help menu you are hear.')
	 .setTimestamp()
	 .setFooter('made by un boxing man yt', 'http://unpix.nwpixs.com/unboxingman%20logo%201.1.png');
	 
	 message.channel.send(helpEmbed)

        const helpEmbedadmin = new Discord.RichEmbed()
	 .setColor('red')
     .setTitle('admin help menu')
 	 .setURL('http://www.unboxingman.com')
	 .setAuthor('un boxing bot', 'http://unpix.nwpixs.com/unboxingman%20logo%201.1.png', 'http://www.unboxingman.com')
	 .setDescription('un boxing bots admin help menu still under dev')
	 .setThumbnail('http://unpix.nwpixs.com/unboxingman%20logo%201.1.png')
	 .addField('!say', 'plays song(url).')
	 //.addField('!stop','stops the song.')
	 //.addField('!join', 'joins the voice channel.', true)
	 //.addField('!leave', 'leaves the voice channel.', true)
     //.addField('!skip', 'skips the song.', true)
     //.addField('!gif (the gif you want)','gets gif of your choice')
	 //.addField('!help','help menu you are hear.')
	 .setTimestamp()
	 .setFooter('made by un boxing man yt', 'http://unpix.nwpixs.com/unboxingman%20logo%201.1.png');
	 
	 message.channel.send("admin help menu coming sowne!")
	 //message.channel.send(helpEmbedadmin)
	

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
	} else if (message.content.startsWith(`${prefix}say`)){ 
         if (message.member.hasPermission( 'MANAGE_MESSAGES', true, true)) {
					
			  // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
			  // To get the "message" itself we join the `args` back into a string with spaces: 
			  var sayMessage = args.join(" ");
			  // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
			  message.delete().catch(O_o=>{}); 
			  // And we get the bot to say the thing: 
			  message.channel.send(sayMessage)};
			  console.log(sayMessage)

    }else if (message.content.startsWith(`${prefix}ping`)) { 
		if (message.member.hasPermission('ADMINISTRATOR',true ,false) || (message.member.hasPermission('MANAGE_MESSAGES',true ,false))){
	     const m = await message.channel.send("Ping?");
		  m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`)
		} else if (!message.member.hasPermission('ADMINISTRATOR',true ,false) || (!message.member.hasPermission('MANAGE_MESSAGES',true ,false))){
			message.channel.send("You need the permissions to MANAGE_MESSAGES or ADMINISTRATOR to use")
			
		}
	}else if (message.content.startsWith(`${prefix}delete`)) {
		 if (message.member.hasPermission('MANAGE_MESSAGES', true , false)){
    
         // get the delete count, as an actual number.
         const deleteCount = parseInt(args[0], 10);
    
         // Ooooh nice, combined conditions. <3
         if(!deleteCount || deleteCount < 2 || deleteCount > 100)
          return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
         // So we get our messages, and delete them. Simple enough, right?
         const fetched = await message.channel.fetchMessages({limit: deleteCount});
          message.channel.bulkDelete(fetched)
		  .catch(error => message.reply(`Couldn't delete messages because of: ${error}`))
		  message.channel.send('dune')
		};
     
	} else if (message.content.startsWith(`${prefix}url`)) {
		var input = message.content;
		var playInput= input.substr('5');
		//connection.playArbitraryInput(playInput)

    } else {
	message.channel.send('You need to enter a valid command!\n try !help')
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

};

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
};



client.login(token)