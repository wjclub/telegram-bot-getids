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

let botName = ""

const getAgeString = (ctx) => {
  const idAgeHelpLink = `<a href="https://t.me/${botName}?start=idhelp">(?)</a>`
  const creationDate = getAge(ctx.from.id)
  return ctx.i18n.t(creationDate[0])+' '+creationDate[1]+' '+idAgeHelpLink
}

bot.start(ctx => {
  if (ctx.message.text == '/start idhelp') {
    ctx.reply(ctx.i18n.t('idhelp'), {parse_mode: 'HTML'})
  } else {
    let msg_text = ctx.i18n.t('start')
    msg_text += "\n\n" + treeify.renderTree(ctx.from, ctx.i18n.t('you_header'))
    ctx.reply(msg_text , {parse_mode: 'HTML'})
  }

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

  // Render CURRENT USER
  if (ctx.message.from !== undefined) {
    ctx.from['created'] = getAgeString(ctx)
    renders.push(treeify.renderTree(ctx.from, ctx.i18n.t('you_header')))
  }

  // Render ORIGIN CHAT
  if (ctx.message.forward_from_chat !== undefined) {
    renders.push(treeify.renderTree(ctx.message.forward_from_chat, ctx.i18n.t('origin_chat_header')))
  }

  // Render ORIGIN ACCOUNT
  if (ctx.message.forward_from !== undefined && ctx.message.from.id != ctx.message.forward_from.id) {
    const fwfrom = ctx.message.forward_from

    if (fwfrom.first_name !== undefined) {
      fwfrom['created'] = getAgeString(ctx)
    }
    renders.push(treeify.renderTree(fwfrom, ctx.i18n.t('forwarded_from_header')))
  }

  // Render PHÒTOS
  if (ctx.message.photo !== undefined) {
    renders.push(treeify.renderTree({
      file_size: ctx.message.photo.pop().file_size
    }, ctx.i18n.t('image_header')))
  }

  // Render STICKERS
  if (ctx.message.sticker !== undefined) {
    const sticker = ctx.message.sticker

    // Remove all file_ids, as they vary between bots
    delete sticker.thumb

    renders.push(treeify.renderTree(sticker, ctx.i18n.t('sticker_header')))
  }

  // Render AUDIO
  if (ctx.message.audio !== undefined) {
    const audio = ctx.message.audio

    // Remove all file_ids, as they vary between bots
    delete audio.thumb
    delete audio.file_id

    renders.push(treeify.renderTree(audio, ctx.i18n.t('audio_header')))
  }

  // Render VIDEOS
  if (ctx.message.video !== undefined) {
    const video = ctx.message.video

    // Remove all file_ids, as they vary between bots
    delete video.thumb
    delete video.file_id

    renders.push(treeify.renderTree(video, ctx.i18n.t('video_header')))
  }

  // Render DOCUMENTS
  if (ctx.message.document !== undefined) {
    const document = ctx.message.document

    // Remove all file_ids, as they vary between bots
    delete document.file_id

    renders.push(treeify.renderTree(document, ctx.i18n.t('document_header')))
  }

  // Render MESSAGE INFO
  const msgInfo = {}
  if (ctx.message.forward_from_message_id !== undefined) {
    const msgId = ctx.message.forward_from_message_id
    const fwdFrom = ctx.message.forward_from_chat
    msgInfo['message_id'] = (fwdFrom.username == undefined) ? msgId :
      `<a href="https://t.me/${fwdFrom.username}/${msgId}}">${msgId}</a>`
  }
  if (Object.keys(msgInfo).length > 0)
    renders.push(treeify.renderTree(msgInfo, ctx.i18n.t('message_header')))


  ctx.reply(renders.join('\n\n'), { parse_mode: 'HTML', disable_web_page_preview: true})

  //console.debug(JSON.stringify(ctx.message, null, 2))
}




bot.on('inline_query', (ctx) => {
  const creationDate = getAge(ctx.from.id)
  const ageString = ctx.i18n.t(creationDate[0])+' '+creationDate[1]
  ctx.from['created'] = ageString
  const msgText = treeify.renderTree(ctx.from, ctx.i18n.t('me_header'))
  const result = [{
    type: 'article',
    id: 'me_' + ctx.from.id,
    title: ctx.i18n.t('inline_query_your_info_header'),
    description: ctx.i18n.t('inline_query_your_info_text'),
    input_message_content: {
      message_text: msgText,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    }
  }]
  ctx.answerInlineQuery(result, {
    is_personal: true,
    cache_time: 30
  })
})


const getUsername = (async function() {
  const botInfo = await bot.telegram.getMe()
  botName = botInfo.username
})
getUsername()

bot.startPolling()
