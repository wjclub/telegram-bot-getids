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

  //console.debug('[/start]', ctx.from.first_name, '->', msg_text)
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

  if (ctx.message.forward_from !== undefined && ctx.message.from.id != ctx.message.forward_from.id) {
    const fwfrom = ctx.message.forward_from

    if (fwfrom.first_name !== undefined) {
      const creationDate = getAge(fwfrom.id)
      const ageString = ctx.i18n.t(creationDate[0])+' '+creationDate[1]
      fwfrom['created'] = ageString
    }
    renders.push(treeify.renderTree(fwfrom, ctx.i18n.t('forwarded_from_header')))
  }


  if (ctx.message.photo !== undefined) {
    renders.push(treeify.renderTree({
      file_size: ctx.message.photo.pop().file_size
    }, ctx.i18n.t('image_header')))
  }

  if (ctx.message.sticker !== undefined) {
    const sticker = ctx.message.sticker

    // Remove all file_ids, as they vary between bots
    delete sticker.thumb

    renders.push(treeify.renderTree(sticker, ctx.i18n.t('sticker_header')))
  }

  if (ctx.message.audio !== undefined) {
    const audio = ctx.message.audio

    // Remove all file_ids, as they vary between bots
    delete audio.thumb
    delete audio.file_id

    renders.push(treeify.renderTree(audio, ctx.i18n.t('audio_header')))
  }

  if (ctx.message.video !== undefined) {
    const video = ctx.message.video

    // Remove all file_ids, as they vary between bots
    delete video.thumb
    delete video.file_id

    renders.push(treeify.renderTree(video, ctx.i18n.t('video_header')))
  }

  if (ctx.message.document !== undefined) {
    const document = ctx.message.document

    // Remove all file_ids, as they vary between bots
    delete document.file_id

    renders.push(treeify.renderTree(document, ctx.i18n.t('document_header')))
  }





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



bot.startPolling()
