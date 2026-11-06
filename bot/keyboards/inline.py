from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from lexicon.ru import LEXICON_RU

def get_guest_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text=LEXICON_RU["btn_request_access"],
                    callback_data="request_access",
                )
            ],
            [
                InlineKeyboardButton(
                    text=LEXICON_RU["btn_contact_dev"],
                    callback_data="contact_dev",
                )
            ],
        ]
    )

def get_contact_cancel_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text=LEXICON_RU["btn_contact_dev_cancel"],
                    callback_data="cancel_contact"
                )
            ]
        ]
    )



def get_user_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text=LEXICON_RU["btn_open_app"],
                    web_app=WebAppInfo(url="https://cuteness-counter.vercel.app/"),
                )
            ]
        ]
    )