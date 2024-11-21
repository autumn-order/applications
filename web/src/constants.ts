import type { CorporationCardData } from "$lib/components/home/CorporationCard.svelte";
import type { FaqData } from "$lib/components/home/Faq.svelte";
import type { Recruiter } from "$lib/components/home/RecruiterCard.svelte";

export const DISCORD_LINK = "https://discord.gg/WvA8Vb9C7D";

export const APPLY_LINK = "/apply"

export const FEATURED_VIDEO = "https://www.youtube.com/embed/AdfFnTt2UT0?si=x3rGt9pHRJHZ9g8i"

export const CORPORATIONS: CorporationCardData[] = [
    {
        corporation_id: 98785281,
        corporation_name: "The Order of Autumn",
        location: "Nullsec",
        apply_text: "Begin Your Journey in Nullsec"
    },
    {
        corporation_id: 98784256,
        corporation_name: "Autumn Highsec Division",
        location: "Highsec",
        apply_text: "Begin Your Journey in Highsec"
    },
]

export const RECRUITERS: Recruiter[] = [
    {
        id: 2114794365,
        name: "Hyziri",
        discord: "hyziri",
        title: "CEO of Autumn"
    }
]

export const FAQ_QUESTIONS: FaqData[] = [
    {
        question: "What is Autumn's Main Focus?",
        answer: "Our primary focus is newer players & helping them grow, outside that we focus on PvP with a mix of industry & PvE on the side."
    },
    {
        question: "What is Autumn's Ultimate Goal?",
        answer: "Our ultimate goal is to make the new player experience in EVE more accessible and engaging. We also aim to build a tight knit community of like minded players who share in our dream of helping newer players grow."
    },
    {
        question: "Is PvP mandatory?",
        answer: "While we have no monthly fleet participation minimums we do require nullsec member attendance for the occasional Call to Action fleets which involves a highly important strategic objective we needs all hands on deck to secure, this ONLY applies if you are online & in-game, don't lose sleep over CTAs, real life always comes first."
    },
    {
        question: "Where are you located?",
        answer: "Our nullsec corporation is located in the region of Pure Blind. Our highsec corporation is located out of Torrinos in the region of Lonetrek."
    },
    {
        question: "What do you use for voice chat?",
        answer: "We primarily use Discord for anything corporation or alliance level. Larger scale coalition fleets use Mumble because multiple channels that can be linked together are essential for large fleets."
    },
    {
        question: "Do I need a microphone to join?",
        answer: "No, you do not need a microphone to join. However, we do recommend having one to participate in voice comms."
    },
    {
        question: "What are the requirements to join?",
        answer: "To join you simply need to put an application in via this Website, you will also need to add your character to an application called SeAT which we use for background checks to mitigate the risk of spies."
    },
    {
        question: "How does Autumn Highsec Division compare to The Order of Autumn?",
        answer: "Autumn Highsec Division is a lot more self-paced, you have access to our community and resources to grow and is intended to ultimately be a starting point before nullsec. The majority of our resources & leadership are focused on growing The Order of Autumn."
    }
]