// Bangla catalog for the public website. PROPOSED wording pending native-speaker review (Q-079).
// Typed against the English site catalog, so a missing key does not compile.
import type { SiteMessages } from './en.js';

export const siteBnBD: SiteMessages = {
  meta: {
    title: 'হাসপাতালের ওয়েবসাইট',
    description: 'এইচএমএস-এ তৈরি একটি হাসপাতালের ওয়েবসাইট।',
  },
  shell: {
    skipToContent: 'মূল অংশে যান',
    emergency: 'জরুরি',
    hotline: 'হটলাইন',
    outsideDhaka: 'ঢাকার বাইরে',
    email: 'ইমেইল',
    menu: 'মেনু',
    closeMenu: 'মেনু বন্ধ করুন',
    mainNavigation: 'প্রধান নেভিগেশন',
    footerNavigation: 'ফুটার',
    languageBangla: 'বাংলা',
    languageEnglish: 'English',
    quickContact: 'ফোন নম্বর ও ভাষা',
    notice: 'নোটিশ',
    language: 'ভাষা',
    allOf: 'সব {name}',
    hideNotice: 'নোটিশ লুকান',
    call: 'কল করুন',
    book: 'বুক করুন',
    homeLink: '{name}, প্রথম পাতা',
    followUs: 'আমাদের অনুসরণ করুন',
    contactUs: 'যোগাযোগ করুন',
    opensInNewTab: '(নতুন ট্যাবে খুলবে)',
  },
  placeholder: {
    heading: 'আমাদের নতুন ওয়েবসাইট আসছে',
    body: 'এটি একটি ডেমো ওয়েবসাইট। পাতাগুলো তৈরি হচ্ছে।',
  },
};
