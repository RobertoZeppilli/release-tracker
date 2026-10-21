// The FAQ, one namespace because it is one page. A question is a key ending in `.q` and its answer
// the matching `.a`, so a question translated without its answer is visible by reading down the
// file. The order here is the order on the page, which is the order a reader scans.
export const faq = {
  "faq.lede":
    "The questions this product is actually asked, answered by what it does rather than by what it would like to do.",

  "faq.section.product": "the product",
  "faq.does.q": "What does Verdict do?",
  "faq.does.a":
    "It follows the releases of the technologies in its catalog and gives each release a single verdict: whether it asks something of you, what breaks, and how to migrate. Every claim points at the line of the release notes it was read from.",
  "faq.add.q": "Can I ask for a technology to be added?",
  "faq.add.a":
    "No. The catalog is curated: a technology enters it when its releases can be followed properly, and that is a decision rather than a queue. You can write and say what you are missing, but there is no request to file and nothing to track.",
  "faq.when.q": "How soon does a new release appear?",
  "faq.when.a":
    "The job that looks for new releases runs once a day. A release page shows the notes as soon as the release is recorded; its verdict appears once the summary has been written, which is a separate job and can lag behind.",
  "faq.read.q": "Do I need an account to read a release?",
  "faq.read.a":
    "No. Release and technology pages are public. An account is only for the part that is yours: following technologies, declaring the version you are on, and the dashboard built from the two.",

  "faq.section.summaries": "the summaries",
  "faq.who.q": "Who writes the summaries?",
  "faq.who.a":
    "A language model, from the release notes the project published and from nothing else. It is given no other source, no other page and no data about any reader.",
  "faq.wrong.q": "Can a summary be wrong?",
  "faq.wrong.a":
    "Yes, and the page is built on the assumption that it can be. That is what the quoted line under a claim is for, and why every page links the notes at their source: the summary is there to save you the reading, not to be believed on its own. When a change is expensive to get wrong, check the cited line.",
  "faq.prompt.q": "Does anything about me go into a prompt?",
  // `{privacy}` is the link to the privacy notice, named in `document`.
  "faq.prompt.a":
    "No. The summaries are written by a job on the server, before anyone opens the page, and that job knows nothing about accounts. A summary is the same text for every reader. The rest of it is in the {privacy}.",

  "faq.section.account": "the account",
  "faq.scope.q": "What does the GitHub sign-in ask for?",
  "faq.scope.a":
    "Your public profile and your email address. No access to any repository, private or public, and nothing is ever written to your GitHub account.",
  // `{limit}` and not `{count}`: the number comes from the Plan and the sentence has one form, so
  // naming it `count` would hand it to the plural rules for nothing.
  "faq.limit.q": "Why {limit} technologies?",
  "faq.limit.a":
    "Because that is what the Free plan holds, and Free is the only plan there is. It is a stack, not a catalog: the limit is what keeps the dashboard a page you can read at a glance.",
  "faq.delete.q": "How do I delete my account?",
  "faq.delete.a":
    "On the {account}. You type one word to confirm, and the account goes at once, with the technologies you followed and the versions you declared. There is no grace period and nothing to undo it with.",
  "faq.cookies.q": "Is there a cookie banner?",
  "faq.cookies.a":
    "No, because there is nothing to ask about: no advertising, no profiling, and no third party setting anything in your browser. Signing in sets the session cookies that keep you signed in, and the theme you pick stays in your own browser.",
} as const;
