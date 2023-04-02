// 01.js: when a user does the !create command they are placed into a voice channel lobby under the Games category.
// 02.js: add the ability for the creator of the game to cancel it.
// 03.js: Error handling for attempting to join or create a game without being in a voice lobby (#queue).
// 04.js: Whenever a new lobby is started or ended a global message appears. Error handling when trying to delete a redundant channel/channel that doesn't exist as well by messaging admin.


const Discord = require('discord.js');
const client = new Discord.Client();
const { registerEvents } = require('./events');
const { registerCommands } = require('./commands');

const prefix = '!';

registerEvents(client, prefix);
registerCommands(client, prefix);


client.login('MTA5MTg3ODgwNTU4NjU4MzY3Mg.G7Gxd_.XZ34y8PDiyhw77QFgKDc73OA5i4gXjeAB-vmGw');
