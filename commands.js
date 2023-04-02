const Discord = require('discord.js');
const lobbies = {};

function registerCommands(client, prefix) {
  client.on('command', (command, message, args) => {
    if (command === 'create') {
      createLobbyCommand(message);
    } else if (command === 'cancel') {
      cancelLobbyCommand(message);
    }
  });
}

function handleVoiceStateUpdate(oldState, newState) {
  if (newState.member.user.bot) return;

  const queueChannel = newState.guild.channels.cache.find(channel => channel.name === 'queue' && channel.type === 'voice');
  const lobbyChannel = newState.guild.channels.cache.find(channel => channel.type === 'voice' && lobbies[oldState.member.user.id] && channel.id === lobbies[oldState.member.user.id].channel.id);

  if (newState.channel && newState.channel.id === queueChannel?.id) {
    if (lobbies[oldState.member.user.id]) {
      oldState.setChannel(lobbies[oldState.member.user.id].channel);
    }
  } else if (lobbyChannel && !lobbyChannel.members.size) {
    lobbyChannel.delete().then(() => {
      const owner = oldState.member.user;
      const lobbyEmbed = new Discord.MessageEmbed()
        .setColor('#00ff00')
        .setTitle(`${owner.username}'s lobby has been canceled!`);
      const testChannel = oldState.guild.channels.cache.find(channel => channel.name === 'test' && channel.type === 'text');
      testChannel.send(`${owner.toString()}`, lobbyEmbed);
      delete lobbies[oldState.member.user.id];
    }).catch(error => {
      if (error.message === 'Unknown Channel' && !lobbyChannel.deleted) {
        const owner = oldState.guild.owner;
        owner.send('Error Code: Attempted to delete redundant channel');
      } else {
        console.error(error);
      }
    });
  }
}

function createLobbyCommand(message) {
  if (lobbies[message.author.id]) {
    message.reply('You already have a lobby!');
    return;
  }
  const queueChannel = message.guild.channels.cache.find(channel => channel.name === 'queue' && channel.type === 'voice');
  if (!queueChannel || !queueChannel.members.has(message.author.id)) {
    message.reply('Please join the #queue channel before attempting to create or join a lobby!');
    return;
  }
  const lobby = {
    owner: message.author.id,
    players: [{
      username: message.author.username,
      id: message.author.id
    }],
    channel: null
  };
  lobbies[message.author.id] = lobby;
  const category = message.guild.channels.cache.find(c => c.name == "Games" && c.type == "category");
  message.guild.channels.create(`${message.author.username}'s Lobby`, {
    type: 'voice',
    parent: category
  }).then(channel => {
    lobby.channel = channel;
    message.member.voice.setChannel(channel).then(() => {
      const owner = message.author;
      const lobbyEmbed = new Discord.MessageEmbed()
        .setColor('#00ff00')
        .setTitle(`${owner.username}'s lobby has been created!`);
      const testChannel = message.guild.channels.cache.find(channel => channel.name === 'test' && channel.type === 'text');
      testChannel.send(`${owner.toString()}`, lobbyEmbed);
    });
  }).catch(console.error);
}

function cancelLobbyCommand(message) {
  const lobby = lobbies[message.author.id];
  if (!lobby) {
    message.reply('You do not have a lobby!');
    return;
  }
  if (lobby.owner !== message.author.id) {
    message.reply('Only the owner of the lobby can cancel it!');
    return;
  }
  lobby.channel.delete().then(() => {
    const owner = message.author;
    const lobbyEmbed = new Discord.MessageEmbed()
      .setColor('#00ff00')
      .setTitle(`${owner.username}'s lobby has been canceled!`);
    const testChannel = message.guild.channels.cache.find(channel => channel.name === 'test' && channel.type === 'text');
    testChannel.send(`${owner.toString()}`, lobbyEmbed);
    delete lobbies[message.author.id];
  }).catch(error => {
    if (error.message === 'Unknown Channel') {
      const owner = message.guild.owner;
      owner.send('Error Code: Attempted to delete redundant channel');
    } else {
      console.error(error);
    }
  });
}

module.exports = {
  registerCommands,
  handleVoiceStateUpdate
};

