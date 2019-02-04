const Telegraf = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)


const TelegrafI18n = require('telegraf-i18n')
const path = require('path')

const i18n = new TelegrafI18n({
  defaultLanguage: 'en',
  allowMissing: true,
  directory: path.resolve(__dirname, 'locales')
})

bot.use(i18n.middleware())

const getAge = require('./idage.js')


bot.start(ctx => {
  const creationDate = getAge(ctx.from.id)
  const ageString = ctx.i18n.t(creationDate[0])+' '+creationDate[1]
  let msg_text = ctx.i18n.t('start', {age: ageString})
  msg_text += "\n\n" + treeify.renderTree(ctx.from, ctx.i18n.t('you_header'))

  ctx.reply(msg_text , {parse_mode: 'HTML'})

  console.debug('[/start]', ctx.from.first_name, '->', msg_text)
})

bot.help(ctx => {
  ctx.reply(ctx.i18n.t('help'), { parse_mode: 'HTML' })
})


const treeify = require('./treeify.js')
bot.on('message', ctx => {

  const renders = []

  if (ctx.from !== undefined) {
    renders.push(treeify.renderTree(ctx.from, 'You'))
  }

  if (ctx.message.forward_from_chat !== undefined) {
    renders.push(treeify.renderTree(ctx.message.forward_from_chat, 'Origin Chat'))
  }

  if (ctx.message.forward_from !== undefined) {
    renders.push(treeify.renderTree(ctx.message.forward_from, 'Forwarded from'))
  }

  if (ctx.message.photo !== undefined) {
    const photo = ctx.message.photo.pop()
    const customPhoto = { file_id: photo.file_id, file_size: photo.file_size }
    renders.push(treeify.renderTree(customPhoto, 'Images'))
  }



  ctx.reply(renders.join('\n\n'), { parse_mode: 'HTML' })



  console.debug(JSON.stringify(ctx.message, null, 2))
})

bot.startPolling()
