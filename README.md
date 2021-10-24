# GetIDsBot

> ## ⚠️ Status of this project
>
> The original developers of this bot mostly moved on and away from Telegram bot development. Please consider this code and bot unmaintained. It may still work, but we won't rush to fix things anymore.

## Introduction

GetIDsBot is a chatbot for the Telegram Messaging Plattform which main purpose
is to extract useful informations from messages that are normally hidden and
to enhance them. This means...

- converting file_sizes and durations to human readable formats.
- interpolating account creation dates from the users chat_id.
- displaying it all [tree(1)'ish'](<https://en.wikipedia.org/wiki/Tree_(command)>).

## Using this bot

**Option A:** Use the version we host at https://t.me/GetIDsBot

**Option B:** Host one yourself. You will need a bot token from the
[BotFather](https://t.me/botfather) and a server with nodejs and npm installed
to run it. Yes, bots are programs and they must run on some computer.

## Account creation dates

Most people want to use this, so here is a bit of explanation for all of you:
Telegram gives each chat (that is users, bots, groups and channels) a globally
unique numerical id. These id numbers aren't given out sequentially, so two users
signing up at the exact same time will probably have a difference of up to a few
millions. Two possible reasons are:

- Sharding: Telegram registrations won't all happen on the same server. To avoid
  giving out the same id twice, all registration servers reserve a range of ids
  from the central registry and periodically fetch new ones.
- Obfuscation: You should not be able to guess the signup date from one's id.

This is still speculation, and we don't know for certain, but averaged out over
a year or so, the IDs do still increase. There are some exceptions, but guessing
is still possible.

We collected a bunch of ids for which we knew the rough creation dates, anonymized
the dates and used some dark magic called "maths" to estimate a creation date.

## Current state of development

Mostly abandoned

## Development / Contribute

The original GetIDsBot was written in PHP. After I (Jonas) realized that PHP is
horrible for anything other than easy deployment and basic templating, I got the
urge to rewrite it in a better language. As you might have already seen, I failed.
It is written in javascript. I hate javascript. But my Rust and Elixir skills are
just mediocre at the time of writing, so here we go:

- Fork this repo and clone it from your account, so you can crate Pull requests.
- If you want to work on a feature, consider branching. I would consider `feature-xy`
  or `fix-xy` a decent naming sheme.
- Run `npm install` in this repo.
- Run the bloody thing with `node index.js`
- Please use propper commit messages like `adds italian translation` or `fixes rounding error`. If you are not a git master like me, sublime merge might save your day.

## Hall of shame

The following people sinned and wrote javascript for this project or did not stop
the others from doing so:

- [Jonas](https://github.com/jfowl) (Code)
- [YouTwitFace](https://github.com/YouTwitFace) (Code)
- [Jan](https://github.com/browny99) (Did not complain)

## License and Copyright

MIT for this project, some BSD and Apache License, Version 2.0 for it's dependencies.
Copyright 2021 Jonas Zohren & other contributors.
