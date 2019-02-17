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
const {formatSizeUnits} = require('./utils.js')


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
  if (ctx.message.chat.type == 'private')
    handlePrivateChat(ctx)
  else
    handleGroupChat(ctx)
})

function handleGroupChat(ctx) {

}

function handlePrivateChat(ctx) {
  const renders = []

  if (ctx.message.from !== undefined) {
    const creationDate = getAge(ctx.from.id)
    const ageString = ctx.i18n.t(creationDate[0])+' '+creationDate[1]
    ctx.from['created'] = ageString
    renders.push(treeify.renderTree(ctx.from, ctx.i18n.t('you_header')))
  }

  if (ctx.message.forward_from_chat !== undefined) {
    renders.push(treeify.renderTree(ctx.message.forward_from_chat, ctx.i18n.t('origin_chat_header')))
  }

  if (ctx.message.forward_from !== undefined) {
    renders.push(treeify.renderTree(ctx.message.forward_from, ctx.i18n.t('forwarded_from_header')))
  }

  if (ctx.message.photo !== undefined) {
    const photo = shortenPhoto(ctx.message.photo)
    renders.push(treeify.renderTree(photo, ctx.i18n.t('image_header')))
  }

  if (ctx.message.audio !== undefined) {
    const audio = ctx.message.audio
    audio['thumb'] = shortenPhoto(audio['thumb'])

    renders.push(treeify.renderTree(audio, ctx.i18n.t('audio_header')))
  }




  ctx.reply(renders.join('\n\n'), { parse_mode: 'HTML' })



  console.debug(JSON.stringify(ctx.message, null, 2))
}


function shortenPhoto(photos) {
  const f = ({file_id, file_size}) => `<code>${file_id}</code> (${treeify.formatSizeUnits(file_size)})`
  if (Array.isArray(photos))
    return photos.map(f)
  else
    return f(photos)
}

bot.startPolling()
