const { Telegraf } = require("telegraf");
const TelegrafI18n = require("telegraf-i18n");
const rateLimit = require("telegraf-ratelimit");
const path = require("path");
const html = require("html-escaper");

const BOT_TOKEN = process.env.BOT_TOKEN;
if (BOT_TOKEN === undefined) {
  console.error(
    "ERROR: You need to provide an environment variable called BOT_TOKEN with the telegram bot token."
  );
  process.exit(1);
}
if (
  BOT_TOKEN.split(":").length !== 2 ||
  BOT_TOKEN.split(":")[1].length !== 35
) {
  console.error(
    "ERROR: The environment variable BOT_TOKEN seems to be malformatted."
  );
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

const i18n = new TelegrafI18n({
  defaultLanguage: "en",
  allowMissing: true,
  directory: path.resolve(__dirname, "locales"),
});

bot.use(i18n.middleware());

const limitConfig = {
  window: 12000,
  limit: 4,
  keyGenerator: (ctx) => {
    if (ctx.chat !== undefined) {
      return ctx.chat.id;
    } else if (ctx.from !== undefined) {
      return ctx.from.id;
    } else {
      return 0;
    }
  },
  onLimitExceeded: (ctx, next) => {
    // Only rate limit in group chats:
    if (ctx.chat !== undefined && ctx.chat.type === "private") next();
  },
};

bot.use(rateLimit(limitConfig));

const getAge = require("./idage.js");

let botName = "";

const getAgeString = (ctx, key) => {
  const idAgeHelpLink = `<a href="https://t.me/${botName}?start=idhelp">(?)</a>`;
  const createDate = getAge(ctx.message[key].id);
  return ctx.i18n.t(createDate[0]) + " " + createDate[1] + " " + idAgeHelpLink;
};

const getDateString = (ctx) => {
  const date = new Date(ctx.message.forward_date * 1000);
  return date.toUTCString();
};

const getAdminsString = async (chatId) => {
  const admins = await bot.telegram.getChatAdministrators(chatId);
  console.log(admins);
  const resStr = admins
    .map(
      (a) =>
        (a.status === "creator" ? "⭐️" : a.user.is_bot ? "🤖" : "👤") +
        " " +
        (a.user.username
          ? '<a href="https://t.me/' + a.user.username + '">'
          : "") +
        html
          .escape(
            a.user.first_name + (a.user.last_name ? " " + a.user.last_name : "")
          )
          .substring(0, 35) +
        (a.user.username ? "</a>" : "")
    )
    .join("\n");

  console.log("AdminsString:", "'" + resStr + "'");
  return resStr;
};

bot.start((ctx) => {
  // Filter out group chats
  if (ctx.message.chat.type !== "private") {
    return false;
  }

  if (ctx.message.text === "/start idhelp") {
    ctx.reply(ctx.i18n.t("idhelp"), { parse_mode: "HTML" });
  } else {
    // username may be not defined, first_name may be empty
    const userIdentity = ctx.chat.username || ctx.chat.first_name;

    let comma = "";
    let username;
    if (userIdentity) {
      username = html.escape(userIdentity);
      comma = ",";
    } else {
      username = ctx.i18n.t("human");
    }

    let msgText = ctx.i18n.t("start", { comma, username });

    msgText += "\n\n" + treeify.renderTree(ctx.from, ctx.i18n.t("you_header"));
    ctx.replyWithHTML(msgText);
  }
});

bot.help((ctx) => {
  ctx.reply(ctx.i18n.t("help"), { parse_mode: "HTML" });
});

const treeify = require("./treeify.js");

bot.command("admins", async (ctx) => {
  if (ctx.chat.type === "private" || ctx.chat.type === "channel") {
    ctx.replyWithHTML(ctx.i18n.t("admin_private_chat"));
  } else {
    const adminsStr = await getAdminsString(ctx.chat.id);
    await ctx.replyWithHTML(ctx.i18n.t("admin_list", { adminsStr }), {
      disable_web_page_preview: true,
    });
  }
});

bot.command("json", (ctx) => {
  if (ctx.message.reply_to_message === undefined) {
    ctx.replyWithHTML(ctx.i18n.t("json_needs_reply"));
  } else {
    const rtm = ctx.message.reply_to_message;
    const jsonStr = html.escape(JSON.stringify(rtm, null, 2));
    if (jsonStr.length > 4096) {
      ctx.replyWithHTML(ctx.i18n.t("json_too_long"), {
        disable_web_page_preview: true,
      });
    } else {
      ctx.replyWithHTML("<code>" + jsonStr + "</code>", {
        disable_web_page_preview: true,
      });
    }
  }
});

bot.command("user", (ctx) => {
  if (ctx.message.reply_to_message === undefined) {
    ctx.replyWithHTML(ctx.i18n.t("user_needs_reply"));
  } else {
    const rtm = ctx.message.reply_to_message;

    rtm.from.created = getAgeString({ message: rtm, i18n: ctx.i18n }, "from");
    ctx.replyWithHTML(treeify.renderTree(rtm.from, ctx.i18n.t("user_header")), {
      disable_web_page_preview: true,
    });
  }
});

bot.command("kill_process", async (ctx) => {
  if (ctx.chat.type === "private" && ctx.from.id === 127782573) {
    setTimeout(() => {
      process.exit(1);
    }, 500);
  }
});

bot.on("message", (ctx) => {
  if (ctx.message.chat.type === "private") {
    handlePrivateChat(ctx);
  } else {
    handleGroupChat(ctx);
  }
});

async function handleGroupChat(ctx) {
  if (ctx.message.new_chat_members !== undefined) {
    if (ctx.message.new_chat_members.some((m) => m.username === botName)) {
      // Bot was just added to group

      const adminsStr = await getAdminsString(ctx.chat.id);
      console.log(adminsStr);

      ctx.replyWithHTML(
        ctx.i18n.t("group_chat_start", {
          chatInfoStr: treeify.renderTree(
            ctx.chat,
            ctx.i18n.t("this_chat_header")
          ),
          adminsStr,
        }),
        {
          disable_web_page_preview: true,
        }
      );
    } else {
      // Other new members
      // TODO: For now, do nothing
    }
  }
}

function handlePrivateChat(ctx) {
  const renders = [];

  // Render CURRENT USER
  if (ctx.message.from !== undefined) {
    ctx.from.created = getAgeString(ctx, "from");
    renders.push(treeify.renderTree(ctx.from, ctx.i18n.t("you_header")));
  }

  // Render ORIGIN CHAT
  if (ctx.message.forward_from_chat !== undefined) {
    renders.push(
      treeify.renderTree(
        ctx.message.forward_from_chat,
        ctx.i18n.t("origin_chat_header")
      )
    );
  }

  // Render ORIGIN ACCOUNT
  if (
    ctx.message.forward_from !== undefined &&
    ctx.message.from.id !== ctx.message.forward_from.id
  ) {
    const fwfrom = ctx.message.forward_from;

    if (fwfrom.first_name !== undefined) {
      fwfrom.created = getAgeString(ctx, "forward_from");
    }
    renders.push(
      treeify.renderTree(fwfrom, ctx.i18n.t("forwarded_from_header"))
    );
  }

  if (ctx.message.forward_sender_name !== undefined) {
    const fwfrom = {
      hidden: ctx.i18n.t("user_hid_account"),
    };
    renders.push(
      treeify.renderTree(fwfrom, ctx.i18n.t("forwarded_from_header"))
    );
  }

  // Render PHÒTOS
  if (ctx.message.photo !== undefined) {
    renders.push(
      treeify.renderTree(
        {
          file_size: ctx.message.photo.pop().file_size,
        },
        ctx.i18n.t("image_header")
      )
    );
  }

  // Render STICKERS
  if (ctx.message.sticker !== undefined) {
    const sticker = ctx.message.sticker;

    // Remove all file_ids, as they vary between bots
    delete sticker.thumb;
    renders.push(treeify.renderTree(sticker, ctx.i18n.t("sticker_header")));
  }

  // Render AUDIO
  if (ctx.message.audio !== undefined) {
    const audio = ctx.message.audio;

    // Remove all file_ids, as they vary between bots
    delete audio.thumb;
    delete audio.file_id;

    renders.push(treeify.renderTree(audio, ctx.i18n.t("audio_header")));
  }

  // Render VIDEOS
  if (ctx.message.video !== undefined) {
    const video = ctx.message.video;

    // Remove all file_ids, as they vary between bots
    delete video.thumb;
    delete video.file_id;

    renders.push(treeify.renderTree(video, ctx.i18n.t("video_header")));
  }

  // Render DOCUMENTS
  if (ctx.message.document !== undefined) {
    const document = ctx.message.document;

    // Remove all file_ids, as they vary between bots
    delete document.file_id;

    renders.push(treeify.renderTree(document, ctx.i18n.t("document_header")));
  }

  // Render native POLLS
  if (ctx.message.poll !== undefined) {
    const poll = ctx.message.poll;

    // Rewrite options to plain array, since we don't get votes anyways.
    poll.options = poll.options.map((o) => o.text);

    renders.push(treeify.renderTree(poll, ctx.i18n.t("poll_header")));
  }

  // Render MESSAGE INFO
  const msgInfo = {};

  // add message_id with link to original chat's message
  if (ctx.message.forward_from_message_id !== undefined) {
    const msgId = ctx.message.forward_from_message_id;
    const fwdFrom = ctx.message.forward_from_chat;
    msgInfo.message_id =
      fwdFrom.username === undefined
        ? msgId
        : `<a href="https://t.me/${fwdFrom.username}/${msgId}">${msgId}</a>`;
  }

  // add original sending date of message
  if (ctx.message.forward_date !== undefined) {
    msgInfo.forward_date = getDateString(ctx);
  }

  // display hidden links
  const hiddenLinks =
    ctx.message.entities === undefined
      ? []
      : ctx.message.entities
          .filter((e) => e.type === "text_link")
          .map((e) => e.url);
  if (hiddenLinks.length > 0) {
    msgInfo.urls = hiddenLinks;
  }

  // only add the 'Message' part if it contains elements
  if (Object.keys(msgInfo).length > 0) {
    renders.push(treeify.renderTree(msgInfo, ctx.i18n.t("message_header")));
  }

  ctx.reply(renders.join("\n\n"), {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });

  // console.debug(JSON.stringify(ctx.message, null, 2))
}

bot.on("inline_query", (ctx) => {
  const creationDate = getAge(ctx.from.id);
  const ageString = ctx.i18n.t(creationDate[0]) + " " + creationDate[1];
  ctx.from.created = ageString;
  const msgText = treeify.renderTree(ctx.from, ctx.i18n.t("me_header"));
  const result = [
    {
      type: "article",
      id: "me_" + ctx.from.id,
      title: ctx.i18n.t("inline_query_your_info_header"),
      description: ctx.i18n.t("inline_query_your_info_text"),
      input_message_content: {
        message_text: msgText,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      },
    },
  ];
  ctx.answerInlineQuery(result, {
    is_personal: true,
    cache_time: 30,
  });
});

const getUsername = async function () {
  const botInfo = await bot.telegram.getMe();
  botName = botInfo.username;
};
getUsername();

console.log(
  `Starting longPolling (chat_id of bot: ${
    process.env.BOT_TOKEN.split(":")[0]
  })...`
);
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))